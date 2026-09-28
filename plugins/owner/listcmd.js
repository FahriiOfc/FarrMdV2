// command/owner/listcmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup');
const SCRAPER_DIR = path.join(PROJECT_ROOT, 'scraper');

export default {
    name: 'listcmd',
    aliases: ['ls', 'dir'],
    category: 'owner',
    description: 'Interactive file explorer with buttons',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, args, sender } = ctx;

        if (!isOwner) {
            console.log(`[LISTCMD] Blocked non-owner: ${sender}`);
            return;
        }

        let targetPath = args.join(' ') || '';

        // ============================================================
        // MENU UTAMA (tanpa argumen)
        // ============================================================

        if (!targetPath) {
            await ctx.react('⏳');

            const headerText = 
                `📂 *FILE EXPLORER*\n\n` +
                `📌 Pilih direktori yang ingin dilihat:`;

            const buttonMessage = {
                text: headerText,
                footer: '📱 FarrMdV1 - Klik salah satu',
                buttons: [
                    {
                        buttonId: 'listcmd_command',
                        buttonText: { displayText: '📁 command/' },
                        type: 1
                    },
                    {
                        buttonId: 'listcmd_lib',
                        buttonText: { displayText: '📁 lib/' },
                        type: 1
                    },
                    {
                        buttonId: 'listcmd_backup',
                        buttonText: { displayText: '💾 backup/' },
                        type: 1
                    },
                    {
                        buttonId: 'listcmd_scraper',
                        buttonText: { displayText: '📁 scraper/' },
                        type: 1
                    }
                ],
                headerType: 1
            };

            try {
                await sock.sendMessage(chat, buttonMessage);
                await ctx.react('✅');
                return;
            } catch (error) {
                console.log('[LISTCMD] Button error:', error.message);
                const fallback = 
                    `📂 *FILE EXPLORER*\n\n` +
                    `📁 command/  - .listcmd command/\n` +
                    `📁 lib/      - .listcmd lib/\n` +
                    `💾 backup/   - .listcmd backup/\n` +
                    `📁 scraper/  - .listcmd scraper/`;
                return fallback;
            }
        }

        // ============================================================
        // LIST FOLDER (jika ada argumen path)
        // ============================================================

        const normalized = path.normalize(targetPath);
        const fullPath = path.resolve(PROJECT_ROOT, normalized);

        const isInCommand = fullPath.startsWith(COMMAND_DIR);
        const isInLib = fullPath.startsWith(LIB_DIR);
        const isInBackup = fullPath.startsWith(BACKUP_DIR);
        const isInScraper = fullPath.startsWith(SCRAPER_DIR);

        if (!isInCommand && !isInLib && !isInBackup && !isInScraper) {
            return '❌ Hanya bisa akses: command/, lib/, backup/, atau scraper/';
        }

        try {
            await fs.access(fullPath);
        } catch {
            return `❌ Path tidak ditemukan: ${targetPath}`;
        }

        const stat = await fs.stat(fullPath);

        if (stat.isFile()) {
            const fileName = path.basename(fullPath);
            const fileSize = (stat.size / 1024).toFixed(2);
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            return `📄 ${fileName}\n📁 ${relativePath}\n📊 ${fileSize} KB`;
        }

        const entries = await fs.readdir(fullPath, { withFileTypes: true });

        const folders = [];
        const jsFiles = [];
        const backupFiles = [];
        const otherFiles = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                folders.push(entry.name);
            } else if (entry.isFile()) {
                if (entry.name.endsWith('.js')) {
                    jsFiles.push(entry.name);
                } else if (entry.name.endsWith('.backup')) {
                    backupFiles.push(entry.name);
                } else {
                    otherFiles.push(entry.name);
                }
            }
        }

        folders.sort();
        jsFiles.sort();
        backupFiles.sort();
        otherFiles.sort();

        const relativePath = path.relative(PROJECT_ROOT, fullPath) || '.';
        const isRoot = relativePath === 'command' || relativePath === 'lib' || relativePath === 'backup' || relativePath === 'scraper' || relativePath === '.';

        let output = `📁 *${relativePath}/*\n`;
        output += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (!isRoot) {
            const parent = path.dirname(relativePath);
            output += `📂 ../${parent}/\n`;
            output += `   ( .listcmd ${parent}/ )\n\n`;
        }

        if (folders.length > 0) {
            for (const folder of folders) {
                output += `📂 ${folder}/\n`;
            }
            output += '\n';
        }

        if (jsFiles.length > 0) {
            for (const file of jsFiles) {
                output += `📄 ${file}\n`;
            }
            output += '\n';
        }

        if (backupFiles.length > 0) {
            for (const file of backupFiles) {
                output += `💾 ${file}\n`;
            }
            output += '\n';
        }

        if (otherFiles.length > 0) {
            for (const file of otherFiles) {
                output += `📄 ${file}\n`;
            }
            output += '\n';
        }

        const total = folders.length + jsFiles.length + backupFiles.length + otherFiles.length;
        output += `━━━━━━━━━━━━━━━━━━━━\n`;
        output += `📊 Total: ${total} items`;

        if (output.length > 4000) {
            try {
                await sock.sendMessage(chat, {
                    document: Buffer.from(output, 'utf8'),
                    fileName: `list_${relativePath.replace(/\//g, '_')}.txt`,
                    mimetype: 'text/plain',
                    caption: `📁 ${relativePath}/`
                });
                return '✅ Daftar dikirim sebagai file!';
            } catch (error) {
                return `❌ Gagal kirim file: ${error.message}`;
            }
        }

        return output;
    }
};
