// command/owner/delcmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const SCRAPER_DIR = path.join(PROJECT_ROOT, 'scraper');

export default {
    name: 'delcmd',
    aliases: ['del'],
    category: 'owner',
    description: 'Delete file in command/, lib/, scraper/',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sender } = ctx;
        const filePath = ctx.args.join(' ') || '';

        if (!isOwner) {
            console.log(`[DELCMD] Blocked non-owner: ${sender}`);
            return;
        }

        if (!filePath) {
            return (
                '❌ Masukkan path file!\n\n' +
                '📌 *Contoh:*\n' +
                '.delcmd command/main/test.js\n' +
                '.delcmd lib/media.js\n' +
                '.delcmd scraper/claudehaiku.js\n' +
                '⚠️ *PERINGATAN:* File akan dihapus PERMANEN!'
            );
        }

        // ============================================================
        // VALIDASI PATH - UPDATED with AI Modules
        // ============================================================

        const normalized = path.normalize(filePath);
        const fullPath = path.resolve(PROJECT_ROOT, normalized);

        const isInCommand = fullPath.startsWith(COMMAND_DIR);
        const isInLib = fullPath.startsWith(LIB_DIR);
        const isInScraper = fullPath.startsWith(SCRAPER_DIR);

        if (!isInCommand && !isInLib && !isInScraper && !isInAI) {
            return '❌ Path harus di command/, lib/, scraper/';
        }

        if (!fullPath.endsWith('.js')) {
            return '❌ File harus .js';
        }

        // ============================================================
        // CEK FILE EXISTS
        // ============================================================

        try {
            await fs.access(fullPath);
        } catch {
            return `❌ File tidak ditemukan: ${filePath}`;
        }

        // ============================================================
        // PROTEKSI FILE CORE
        // ============================================================

        const fileName = path.basename(fullPath);
        const coreFiles = ['handler.js', 'connection.js', 'identity.js', 'permissions.js', 'serializer.js', 'commandLoader.js', 'index.js'];
        
        if (coreFiles.includes(fileName) && !ctx.args.includes('--force')) {
            return (
                `⚠️ *PERINGATAN!*\n\n` +
                `File ${fileName} adalah file CORE bot.\n` +
                `Menghapusnya akan membuat bot mati.\n\n` +
                `Gunakan .delcmd ${filePath} --force jika yakin.`
            );
        }

        // ============================================================
        // HAPUS FILE
        // ============================================================

        try {
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            
            if (isInCommand) {
                const commandLoader = ctx.commandLoader || global.commandLoader;
                const name = commandLoader?.getCommand?.(path.basename(fullPath, '.js'))?.name;
                if (name) {
                    console.log('[DELCMD] Unregistering:', name);
                }
            }

            await fs.unlink(fullPath);
            console.log('[DELCMD] Deleted:', fullPath);
            
            if (isInCommand) {
                const commandLoader = ctx.commandLoader || global.commandLoader;
                if (commandLoader) {
                    await commandLoader.scanCommands();
                }
            }

            return (
                `✅ File berhasil dihapus!\n\n` +
                `📁 ${relativePath}\n\n` +
                `⚠️ File sudah tidak ada di disk.`
            );
        } catch (error) {
            return `❌ Gagal menghapus file: ${error.message}`;
        }
    }
};
