// command/owner/restorecmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backup');

export default {
    name: 'restorecmd',
    aliases: ['restore', 'undo'],
    category: 'owner',
    description: 'Restore file from backup/ folder',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, args, sender } = ctx;

        if (!isOwner) {
            console.log(`[RESTORECMD] Blocked non-owner: ${sender}`);
            return;
        }

        const filePath = args.join(' ') || '';

        if (!filePath) {
            return (
                '❌ Masukkan path file!\n\n' +
                '📌 *Contoh:*\n' +
                '.restorecmd lib/media.js\n' +
                '.restorecmd command/main/menu.js'
            );
        }

        const normalized = path.normalize(filePath);
        const fullPath = path.resolve(PROJECT_ROOT, normalized);

        const isInCommand = fullPath.startsWith(COMMAND_DIR);
        const isInLib = fullPath.startsWith(LIB_DIR);

        if (!isInCommand && !isInLib) {
            return '❌ Path harus di command/ atau lib/';
        }

        if (!fullPath.endsWith('.js')) {
            return '❌ File harus .js';
        }

        // Cek backup di folder backup/
        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        const backupPath = path.join(BACKUP_DIR, relativePath + '.backup');

        try {
            await fs.access(backupPath);
        } catch {
            return (
                `❌ Tidak ada backup untuk: ${filePath}\n\n` +
                `💡 Backup tersimpan di backup/${relativePath}.backup`
            );
        }

        try {
            const backupContent = await fs.readFile(backupPath, 'utf8');
            await fs.writeFile(fullPath, backupContent, 'utf8');

            return (
                `✅ File berhasil direstore!\n\n` +
                `📁 ${relativePath}\n` +
                `📦 Dari: backup/${relativePath}.backup`
            );

        } catch (error) {
            return `❌ Gagal restore: ${error.message}`;
        }
    }
};
