// command/vps/mkdir.js
// 📁 Buat folder baru

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default {
    name: 'mkdir',
    aliases: ['createdir'],
    category: 'vps',
    description: '📁 Create new directory',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return '❌ *Cara penggunaan:*\n.mkdir <nama_folder>';
        }

        const userPath = args.join(' ');
        const fullPath = path.resolve(PROJECT_ROOT, userPath);

        if (!fullPath.startsWith(PROJECT_ROOT) && !fullPath.startsWith('/')) {
            await react('❌');
            return '❌ Akses tidak diizinkan.';
        }

        try {
            await fs.mkdir(fullPath, { recursive: true });
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            await react('✅');
            return `✅ *Folder berhasil dibuat!*\n\n📁 ${relativePath}/`;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};