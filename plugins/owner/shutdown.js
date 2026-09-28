// command/owner/shutdown.js

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const FOLDER_NAME = path.basename(PROJECT_ROOT);

console.log('[SHUTDOWN] Folder name:', FOLDER_NAME);

export default {
    name: 'shutdown',
    aliases: ['stop', 'die', 'killbot', 'sh', 'init 0'],
    category: 'owner',
    description: 'Shutdown bot completely (stop PM2 process)',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, sender } = ctx;

        if (!isOwner) {
            console.log(`[SHUTDOWN] Blocked non-owner: ${sender}`);
            return;
        }

        await ctx.react('⏳');

        let statusMsgKey = null;

        try {
            // ============================================================
            // CEK PM2 PROCESS
            // ============================================================

            const { stdout: listStdout } = await execAsync('pm2 list --no-color');
            console.log('[SHUTDOWN] PM2 list:\n', listStdout);
            
            // Daftar nama process berdasarkan folder
            const possibleNames = [
                FOLDER_NAME,
                'FarrMdV1',
                'FarrMdV1-biasa',
                'FarrMdV1-bisnis',
                FOLDER_NAME.toLowerCase(),
                FOLDER_NAME.replace(/-/g, '_'),
                'farr-md-v1', 'farrmd', 'index'
            ];
            
            let pm2Name = '';
            let pm2Id = '';

            const lines = listStdout.split('\n');
            for (const line of lines) {
                for (const name of possibleNames) {
                    if (line.includes(name) && line.includes('online')) {
                        pm2Name = name;
                        const idMatch = line.match(/^│\s*(\d+)/);
                        if (idMatch) pm2Id = idMatch[1];
                        console.log(`[SHUTDOWN] Found match: ${name} (ID: ${pm2Id})`);
                        break;
                    }
                }
                if (pm2Name) break;
            }

            if (!pm2Name) {
                for (const line of lines) {
                    if (line.includes('online') && line.includes('│')) {
                        const parts = line.split('│').filter(s => s.trim());
                        if (parts.length > 1) {
                            pm2Name = parts[1].trim();
                            const idMatch = line.match(/^│\s*(\d+)/);
                            if (idMatch) pm2Id = idMatch[1];
                            console.log('[SHUTDOWN] Found fallback:', pm2Name);
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

            console.log(`[SHUTDOWN] Selected PM2 process: ${pm2Name} (ID: ${pm2Id})`);

            // ============================================================
            // KIRIM PESAN KONFIRMASI
            // ============================================================

            const statusMsg = await ctx.reply(
                `🛑 *Shutting down bot...*\n\n` +
                `📌 Process: ${pm2Name}\n` +
                `📁 Folder: ${FOLDER_NAME}\n` +
                `⏳ Mohon tunggu 5 detik...\n\n` +
                `⚠️ Bot akan MATI TOTAL!\n` +
                `💡 Nyalakan ulang dengan:\n` +
                `pm2 start index.js --name ${pm2Name}`
            );
            statusMsgKey = statusMsg.key;

            // ============================================================
            // STOP PM2 PROCESS
            // ============================================================

            const stopTarget = pm2Id || pm2Name;
            console.log(`[SHUTDOWN] Executing: pm2 stop ${stopTarget}`);
            
            const { stdout, stderr } = await execAsync(`pm2 stop ${stopTarget}`);
            console.log('[SHUTDOWN] PM2 output:', stdout);

            if (stderr) {
                console.log('[SHUTDOWN] PM2 stderr:', stderr);
            }

            // ============================================================
            // CEK STATUS SETELAH STOP
            // ============================================================

            await new Promise(resolve => setTimeout(resolve, 3000));

            const { stdout: statusStdout } = await execAsync('pm2 list --no-color');
            
            let status = '⛔ stopped';
            for (const line of statusStdout.split('\n')) {
                if (line.includes(pm2Name) || (pm2Id && line.includes(pm2Id))) {
                    if (line.includes('stopped')) {
                        status = '⛔ stopped';
                    } else if (line.includes('online')) {
                        status = '🟢 online (gagal stop)';
                    } else if (line.includes('errored')) {
                        status = '🟠 errored';
                    }
                    break;
                }
            }

            const timestamp = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour12: false
            });

            const successText = 
                `🛑 *Bot Shutdown!*\n\n` +
                `📌 Process: ${pm2Name}\n` +
                `📁 Folder: ${FOLDER_NAME}\n` +
                `📊 Status: ${status}\n` +
                `📅 ${timestamp}\n\n` +
                `💡 Nyalakan ulang dengan:\n` +
                `pm2 start index.js --name ${pm2Name}\n\n` +
                `⚠️ Bot sudah tidak aktif.`;

            // ============================================================
            // EDIT PESAN
            // ============================================================

            try {
                await sock.sendMessage(chat, {
                    text: successText,
                    edit: statusMsgKey
                });
                console.log('[SHUTDOWN] Message edited');
            } catch (editError) {
                console.log('[SHUTDOWN] Edit failed:', editError.message);
                try {
                    await ctx.reply(successText);
                } catch (sendError) {
                    console.log('[SHUTDOWN] Send failed:', sendError.message);
                }
            }

            await ctx.react('🛑');

            // ============================================================
            // EXIT PROCESS (biar bot benar-benar mati)
            // ============================================================

            console.log('[SHUTDOWN] Bot will exit in 3 seconds...');
            setTimeout(() => {
                process.exit(0);
            }, 3000);

        } catch (error) {
            console.error('[SHUTDOWN] Error:', error.message);
            console.error('[SHUTDOWN] Stack:', error.stack);
            await ctx.react('❌');
            
            const errorText = `❌ *Shutdown Failed!*\n\n📌 Process: ${pm2Name || 'unknown'}\n📁 Folder: ${FOLDER_NAME}\n\nError: ${error.message}`;
            
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