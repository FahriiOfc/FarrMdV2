// command/owner/editcmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup');

const CORE_FILES = [
    'handler.js', 'connection.js', 'identity.js',
    'permissions.js', 'serializer.js', 'commandLoader.js',
    'index.js'
];

export default {
    name: 'editcmd',
    aliases: ['edit', 'ed'],
    category: 'owner',
    description: 'Edit file in command/, lib/ (auto backup & reload)',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, quoted, args, sender } = ctx;

        if (!isOwner) {
            console.log(`[EDITCMD] Blocked non-owner: ${sender}`);
            return;
        }

        await ctx.react('⏳');

        // Parse argumen
        let filePath = '';
        let isForce = false;

        for (const arg of args) {
            if (arg === '--force' || arg === '-force') {
                isForce = true;
            } else {
                filePath += (filePath ? ' ' : '') + arg;
            }
        }

        if (!filePath) {
            await ctx.react('❌');
            return (
                '❌ Masukkan path file!\n\n' +
                '📌 *Contoh:*\n' +
                '.editcmd lib/media.js\n' +
                '.editcmd command/main/menu.js\n' +
                '📌 *Edit file CORE:*\n' +
                '.editcmd lib/handler.js --force'
            );
        }

        // ============================================================
        // VALIDASI PATH
        // ============================================================

        const normalized = path.normalize(filePath);
        const fullPath = path.resolve(PROJECT_ROOT, normalized);

        const isInCommand = fullPath.startsWith(COMMAND_DIR);
        const isInLib = fullPath.startsWith(LIB_DIR);

        if (!isInCommand && !isInLib && !isInAI) {
            await ctx.react('❌');
            return '❌ Path harus di command/, lib/';
        }

        if (!fullPath.endsWith('.js')) {
            await ctx.react('❌');
            return '❌ File harus .js';
        }

        try {
            await fs.access(fullPath);
        } catch {
            await ctx.react('❌');
            return `❌ File tidak ditemukan: ${filePath}`;
        }

        // Proteksi file core
        const fileName = path.basename(fullPath);
        if (CORE_FILES.includes(fileName) && !isForce) {
            await ctx.react('⚠️');
            return (
                `⚠️ *PROTEKSI!*\n\n` +
                `File *${fileName}* adalah file CORE bot.\n\n` +
                `Jika salah edit, bot bisa MATI TOTAL.\n\n` +
                `📌 *Cara bypass:*\n` +
                `.editcmd ${filePath} --force\n\n` +
                `💡 *Saran:* Backup dulu dengan .getcmd ${filePath}`
            );
        }

        // Ambil source baru
        let newSource = null;

        if (quoted) {
            const quotedMsg = quoted.message;
            if (quotedMsg?.documentMessage) {
                try {
                    const { downloadMediaMessage } = await import('@chaeulso/baileys');
                    const buffer = await downloadMediaMessage(
                        { key: quoted.key, message: quotedMsg },
                        'buffer',
                        {},
                        { logger: console, reuploadRequest: sock.updateMediaMessage }
                    );
                    if (buffer) newSource = buffer.toString('utf8');
                } catch (e) {
                    console.log('[EDITCMD] Download error:', e.message);
                }
            } else if (quoted.text) {
                newSource = quoted.text;
            }
        }

        if (!newSource) {
            await ctx.react('❌');
            return '❌ Tidak ada source code baru! Reply ke file JS atau teks.';
        }

        // Validasi command
        let isCommand = false;
        if (isInCommand) {
            if (!newSource.includes('export default') || !newSource.includes('execute')) {
                await ctx.react('❌');
                return '❌ Source tidak valid! Command harus format yang benar.';
            }
            isCommand = true;
        }

        // ============================================================
        // SIMPAN FILE + BACKUP
        // ============================================================

        try {
            const oldContent = await fs.readFile(fullPath, 'utf8');
            
            // ✅ RELATIVE PATH DARI PROJECT ROOT
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            
            // ✅ BACKUP PATH DENGAN .backup
            const backupPath = path.join(BACKUP_DIR, relativePath + '.backup');
            
            // ✅ BUAT FOLDER BACKUP (AUTO CREATE)
            await fs.mkdir(path.dirname(backupPath), { recursive: true });
            
            // ✅ TULIS BACKUP
            await fs.writeFile(backupPath, oldContent, 'utf8');
            console.log('[EDITCMD] ✅ Backup saved:', backupPath);

            // ✅ TULIS FILE BARU
            await fs.writeFile(fullPath, newSource, 'utf8');
            console.log('[EDITCMD] ✅ File updated:', fullPath);

            let resultMessage = 
                `✅ File berhasil diupdate!\n\n` +
                `📁 ${relativePath}\n` +
                `📦 Backup: backup/${relativePath}.backup`;

            // ============================================================
            // ✅ AUTO RELOAD (PAKAI global.commandLoader)
            // ============================================================

            if (isCommand) {
                try {
                    const commandLoader = global.commandLoader;
                    if (commandLoader && typeof commandLoader.scanCommands === 'function') {
                        await commandLoader.scanCommands();
                        resultMessage += `\n\n✅ Command langsung aktif tanpa restart!`;
                        console.log('[EDITCMD] ✅ Auto-reload success');
                    } else {
                        resultMessage += `\n\n⚠️ Command loader tidak tersedia. Restart manual dengan .reload`;
                        console.log('[EDITCMD] ⚠️ Command loader not available');
                    }
                } catch (error) {
                    console.error('[EDITCMD] Reload error:', error.message);
                    resultMessage += `\n\n⚠️ Auto-reload gagal: ${error.message}\nGunakan .reload manual`;
                }
            } else {
                resultMessage += `\n\n📦 File berhasil diupdate (library/AI modules).`;
            }

            await ctx.react('✅');
            return resultMessage;

        } catch (error) {
            console.error('[EDITCMD] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal menulis file: ${error.message}`;
        }
    }
};
