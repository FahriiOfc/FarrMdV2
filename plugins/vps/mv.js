// command/vps/mv.js
// 🔄 Pindahkan/rename file

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default {
    name: 'mv',
    aliases: ['move', 'rename'],
    category: 'vps',
    description: '🔄 Move or rename file/directory',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length < 2) {
            await react('❌');
            return '❌ *Cara penggunaan:*\n.mv <source> <destination>';
        }

        const sourcePath = args[0];
        const destPath = args.slice(1).join(' ');

        const sourceFull = path.resolve(PROJECT_ROOT, sourcePath);
        const destFull = path.resolve(PROJECT_ROOT, destPath);

        if (!sourceFull.startsWith(PROJECT_ROOT) || !destFull.startsWith(PROJECT_ROOT)) {
            await react('❌');
            return '❌ Akses tidak diizinkan.';
        }

        try {
            await fs.rename(sourceFull, destFull);
            const relSource = path.relative(PROJECT_ROOT, sourceFull);
            const relDest = path.relative(PROJECT_ROOT, destFull);
            await react('✅');
            return `✅ *Berhasil dipindahkan!*\n\n📁 ${relSource} → ${relDest}`;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};