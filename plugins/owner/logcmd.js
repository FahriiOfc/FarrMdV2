// command/owner/logcmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));

// PM2 NAMES
const PM2_NAMES = ['farr-md-v1', 'index', 'farrmd', 'farr-md'];

export default {
    name: 'logcmd',
    aliases: ['logs', 'log'],
    category: 'owner',
    description: 'Get recent PM2 terminal logs',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, args, sender } = ctx;

        // ============================================================
        // VALIDASI: HANYA OWNER
        // ============================================================

        if (!isOwner) {
            console.log(`[LOGCMD] Blocked non-owner: ${sender}`);
            return;
        }

        // ============================================================
        // PARSE ARGUMEN
        // ============================================================

        let lines = 20;
        let filter = '';
        let showError = false;

        for (const arg of args) {
            if (/^\d+$/.test(arg)) {
                lines = parseInt(arg);
            } else if (arg.startsWith('filter:')) {
                filter = arg.replace('filter:', '').toLowerCase();
            } else if (arg === '--error' || arg === '-e') {
                showError = true;
            }
        }

        if (lines > 50) lines = 50;
        if (lines < 5) lines = 5;

        await ctx.react('⏳');

        // ============================================================
        // CARI PM2 PROCESS NAME
        // ============================================================

        let pm2Name = '';
        let pm2Id = '';

        try {
            const { stdout } = await execAsync('pm2 list --no-color');
            const lines_array = stdout.split('\n');
            
            for (const line of lines_array) {
                // Cari nama di PM2_NAMES
                for (const name of PM2_NAMES) {
                    if (line.includes(name) && line.includes('online')) {
                        pm2Name = name;
                        // Ambil ID dari kolom pertama
                        const idMatch = line.match(/^│\s*(\d+)/);
                        if (idMatch) pm2Id = idMatch[1];
                        break;
                    }
                }
                if (pm2Name) break;
            }

            // Jika tidak ditemukan, coba cari berdasarkan folder
            if (!pm2Name) {
                const folderName = path.basename(PROJECT_ROOT);
                for (const line of lines_array) {
                    if (line.includes(folderName) && line.includes('online')) {
                        pm2Name = folderName;
                        const idMatch = line.match(/^│\s*(\d+)/);
                        if (idMatch) pm2Id = idMatch[1];
                        break;
                    }
                }
            }

            console.log('[LOGCMD] PM2 process:', pm2Name || 'not found', 'ID:', pm2Id || 'none');
        } catch (e) {
            console.log('[LOGCMD] PM2 list error:', e.message);
        }

        // ============================================================
        // DETEKSI FILE LOG PM2
        // ============================================================

        let logContent = '';
        let logSource = '';
        let logPath = '';

        // Coba berbagai kemungkinan path log
        const possibleLogs = [];

        // 1. Berdasarkan nama process
        if (pm2Name) {
            possibleLogs.push(
                path.join(process.env.HOME || '~', '.pm2', 'logs', `${pm2Name}-out.log`),
                path.join(process.env.HOME || '~', '.pm2', 'logs', `${pm2Name}-error.log`),
                path.join(process.env.HOME || '~', '.pm2', 'logs', `${pm2Name}.log`)
            );
        }

        // 2. Berdasarkan ID
        if (pm2Id) {
            possibleLogs.push(
                path.join(process.env.HOME || '~', '.pm2', 'logs', `${pm2Id}-out.log`),
                path.join(process.env.HOME || '~', '.pm2', 'logs', `${pm2Id}-error.log`)
            );
        }

        // 3. Generic
        possibleLogs.push(
            path.join(process.env.HOME || '~', '.pm2', 'logs', 'farr-md-v1-out.log'),
            path.join(process.env.HOME || '~', '.pm2', 'logs', 'farr-md-v1-error.log'),
            path.join(process.env.HOME || '~', '.pm2', 'logs', 'index-out.log'),
            path.join(process.env.HOME || '~', '.pm2', 'logs', 'index-error.log')
        );

        // Coba baca setiap kemungkinan
        for (const logFile of possibleLogs) {
            try {
                await fs.access(logFile);
                const content = await fs.readFile(logFile, 'utf8');
                const allLines = content.split('\n').filter(Boolean);
                const recent = allLines.slice(-lines);
                
                // Cek apakah ini log yang benar (ada timestamp atau command)
                const hasLog = recent.some(line => 
                    line.includes('[') || 
                    line.includes('CMD') || 
                    line.includes('ERROR') ||
                    line.includes('SYSTEM')
                );

                if (hasLog || recent.length > 0) {
                    logContent = recent.join('\n');
                    logPath = logFile;
                    logSource = path.basename(logFile);
                    console.log('[LOGCMD] Found log:', logPath);
                    break;
                }
            } catch (e) {
                // Skip
            }
        }

        // ============================================================
        // FALLBACK: PM2 CLI
        // ============================================================

        if (!logContent) {
            try {
                const logType = showError ? 'err' : 'out';
                const pm2LogCmd = pm2Name 
                    ? `pm2 logs ${pm2Name} --lines ${lines} --nostream`
                    : `pm2 logs --lines ${lines} --nostream`;
                
                console.log('[LOGCMD] Using PM2 CLI:', pm2LogCmd);
                
                const { stdout, stderr } = await execAsync(pm2LogCmd);
                logContent = stdout || stderr;
                logSource = 'PM2 CLI';
                
                // Bersihkan log dari format PM2
                if (logContent) {
                    const lines_array = logContent.split('\n');
                    // Ambil hanya baris yang mengandung timestamp atau log
                    const filtered = lines_array.filter(line => 
                        line.includes('|') || 
                        line.includes('[') || 
                        line.includes('CMD') ||
                        line.trim().length > 0
                    );
                    logContent = filtered.slice(-lines).join('\n');
                }
            } catch (pm2Error) {
                console.log('[LOGCMD] PM2 CLI error:', pm2Error.message);
                logContent = '❌ Gagal ambil log. Pastikan PM2 berjalan.';
                logSource = 'Error';
            }
        }

        // ============================================================
        // FILTER
        // ============================================================

        if (filter && logContent && !logContent.includes('Gagal')) {
            const filtered = logContent.split('\n')
                .filter(line => line.toLowerCase().includes(filter))
                .join('\n');
            
            if (filtered) {
                logContent = filtered;
            } else {
                logContent = `Tidak ada log mengandung "${filter}"`;
            }
        }

        // ============================================================
        // POTONG AGAR TIDAK KEPANJANGAN
        // ============================================================

        const MAX_CHARS = 3800;

        if (logContent.length > MAX_CHARS) {
            const first = logContent.slice(0, 1500);
            const last = logContent.slice(-1500);
            const totalLines = logContent.split('\n').length;
            logContent = `${first}\n\n... (${totalLines - 30} baris terpotong) ...\n\n${last}`;
        }

        if (logContent.length > MAX_CHARS) {
            logContent = logContent.slice(0, MAX_CHARS - 100) + '\n\n... (terpotong)';
        }

        // ============================================================
        // BUILD OUTPUT
        // ============================================================

        const timestamp = new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: false
        });

        let output = `📋 *LOG (${lines} baris)*`;
        if (showError) output += ` ⚠️ Error`;
        if (filter) output += ` 🔍 ${filter}`;
        if (pm2Name) output += ` | ${pm2Name}`;
        output += `\n${'─'.repeat(20)}\n`;

        if (logContent && !logContent.includes('Gagal')) {
            output += logContent;
        } else {
            output += logContent || '(Tidak ada log)';
        }

        output += `\n\n${'─'.repeat(20)}`;
        output += `\n📅 ${timestamp}`;
        if (logPath) output += `\n📁 ${logPath}`;

        // ============================================================
        // KIRIM
        // ============================================================

        await ctx.reply(output);
        await ctx.react('✅');
    }
};