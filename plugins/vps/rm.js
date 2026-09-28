// command/vps/rm.js
// 🗑️ Hapus file/folder

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default {
    name: 'rm',
    aliases: ['del', 'remove'],
    category: 'vps',
    description: '🗑️ Delete file or directory',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return '❌ *Cara penggunaan:*\n.rm <path/file.js>';
        }

        const userPath = args.join(' ');
        const fullPath = path.resolve(PROJECT_ROOT, userPath);

        if (!fullPath.startsWith(PROJECT_ROOT) && !fullPath.startsWith('/')) {
            await react('❌');
            return '❌ Akses tidak diizinkan.';
        }

        // Proteksi file/folder penting
        const protectedPaths = ['index.js', 'config.js', 'lib', 'command'];
        for (const p of protectedPaths) {
            if (fullPath.includes(p)) {
                await react('❌');
                return `❌ Tidak boleh menghapus: ${p}`;
            }
        }

        try {
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                await fs.rm(fullPath, { recursive: true, force: true });
            } else {
                await fs.unlink(fullPath);
            }
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            await react('✅');
            return `✅ *Berhasil dihapus!*\n\n🗑️ ${relativePath}`;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};