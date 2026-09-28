// command/owner/restart.js

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const FOLDER_NAME = path.basename(PROJECT_ROOT);

console.log('[RESTART] Folder name:', FOLDER_NAME);

export default {
    name: 'restart',
    aliases: ['reboot', 'pm2restart'],
    category: 'owner',
    description: 'Restart bot via PM2 from WhatsApp',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, sender } = ctx;

        if (!isOwner) {
            console.log(`[RESTART] Blocked non-owner: ${sender}`);
            return;
        }

        await ctx.react('⏳');

        let statusMsgKey = null;

        try {
            // ============================================================
            // CEK PM2 PROCESS
            // ============================================================

            const { stdout: listStdout } = await execAsync('pm2 list --no-color');
            console.log('[RESTART] PM2 list:\n', listStdout);
            
            // ============================================================
            // DAFTAR NAMA PROCESS - PRIORITAS: FOLDER NAME
            // ============================================================

            const possibleNames = [
                FOLDER_NAME,                          // FarrMdV1-biasa atau FarrMdV1-bisnis
                FOLDER_NAME.toLowerCase(),            // farr-md-v1-biasa
                FOLDER_NAME.replace(/-/g, '_'),       // FarrMdV1_biasa
                'FarrMdV1', 'farr-md-v1', 'farrmd',
                'index', 'FarrMdV1-biasa', 'FarrMdV1-bisnis',
                'FarrMdV1-utama', 'FarrMdV1-clone'
            ];
            
            let pm2Name = '';
            let pm2Id = '';

            // Cari nama process yang online
            const lines = listStdout.split('\n');
            for (const line of lines) {
                for (const name of possibleNames) {
                    if (line.includes(name) && line.includes('online')) {
                        pm2Name = name;
                        const idMatch = line.match(/^│\s*(\d+)/);
                        if (idMatch) pm2Id = idMatch[1];
                        console.log(`[RESTART] Found match: ${name} (ID: ${pm2Id})`);
                        break;
                    }
                }
                if (pm2Name) break;
            }

            // Jika tidak ditemukan, coba ambil process pertama yang online
            if (!pm2Name) {
                for (const line of lines) {
                    if (line.includes('online') && line.includes('│')) {
                        const parts = line.split('│').filter(s => s.trim());
                        if (parts.length > 1) {
                            pm2Name = parts[1].trim();
                            const idMatch = line.match(/^│\s*(\d+)/);
                            if (idMatch) pm2Id = idMatch[1];
                            console.log('[RESTART] Found fallback:', pm2Name);
                            break;
                        }
                    }
                }
            }

            if (!pm2Name) {
                await ctx.react('❌');
                await ctx.reply(
                    '❌ Tidak ada process PM2 yang ditemukan!\n\n' +
                    '📌 *Cara jalankan:*\n' +
                    `pm2 start index.js --name ${FOLDER_NAME}\n\n` +
                    '📌 *Lihat process:*\n' +
                    'pm2 list'
                );
                return;
            }

            console.log(`[RESTART] Selected PM2 process: ${pm2Name} (ID: ${pm2Id})`);

            // ============================================================
            // KIRIM PESAN STATUS
            // ============================================================

            const statusMsg = await ctx.reply(
                `🔄 *Restarting bot...*\n\n` +
                `📌 Process: ${pm2Name}\n` +
                `📁 Folder: ${FOLDER_NAME}\n` +
                `⏳ Mohon tunggu 8-10 detik...`
            );
            statusMsgKey = statusMsg.key;

            // ============================================================
            // RESTART VIA PM2
            // ============================================================

            const restartTarget = pm2Id || pm2Name;
            console.log(`[RESTART] Executing: pm2 restart ${restartTarget}`);
            
            const { stdout, stderr } = await execAsync(`pm2 restart ${restartTarget}`);
            console.log('[RESTART] PM2 output:', stdout);

            if (stderr) {
                console.log('[RESTART] PM2 stderr:', stderr);
            }

            // ============================================================
            // TUNGGU 8 DETIK
            // ============================================================

            console.log('[RESTART] Waiting 8 seconds for bot to stabilize...');
            await new Promise(resolve => setTimeout(resolve, 8000));

            // ============================================================
            // CEK STATUS SETELAH RESTART
            // ============================================================

            const { stdout: statusStdout } = await execAsync('pm2 list --no-color');
            
            let status = '🟢 online';
            let statusFound = false;
            
            for (const line of statusStdout.split('\n')) {
                if (line.includes(pm2Name) || (pm2Id && line.includes(pm2Id))) {
                    statusFound = true;
                    if (line.includes('online')) {
                        status = '🟢 online';
                    } else if (line.includes('stopped')) {
                        status = '🔴 stopped';
                    } else if (line.includes('errored')) {
                        status = '🟠 errored';
                    } else if (line.includes('starting')) {
                        status = '🟡 starting';
                    }
                    break;
                }
            }

            if (!statusFound) {
                status = '🟣 unknown (process not found)';
            }

            const timestamp = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour12: false
            });

            const successText = 
                `✅ *Bot Restarted!*\n\n` +
                `📌 Process: ${pm2Name}\n` +
                `📁 Folder: ${FOLDER_NAME}\n` +
                `📊 Status: ${status}\n` +
                `📅 ${timestamp}\n\n` +
                `💡 Bot siap digunakan kembali.`;

            // ============================================================
            // EDIT PESAN
            // ============================================================

            try {
                await sock.sendMessage(chat, {
                    text: successText,
                    edit: statusMsgKey
                });
                console.log('[RESTART] Message edited successfully');
            } catch (editError) {
                console.log('[RESTART] Edit failed:', editError.message);
                try {
                    await ctx.reply(successText);
                    console.log('[RESTART] Sent new message as fallback');
                } catch (sendError) {
                    console.log('[RESTART] Send fallback failed:', sendError.message);
                }
            }

            await ctx.react('✅');

        } catch (error) {
            console.error('[RESTART] Error:', error.message);
            console.error('[RESTART] Stack:', error.stack);
            await ctx.react('❌');
            
            const errorText = `❌ *Restart Failed!*\n\n📌 Process: ${pm2Name || 'unknown'}\n📁 Folder: ${FOLDER_NAME}\n\nError: ${error.message}`;
            
            if (statusMsgKey) {
                try {
                    await sock.sendMessage(chat, {
                        text: errorText,
                        edit: statusMsgKey
                    });
                } catch (e) {
                    await ctx.reply(errorText);
                }
            } else {
                await ctx.reply(errorText);
            }
        }
    }
};