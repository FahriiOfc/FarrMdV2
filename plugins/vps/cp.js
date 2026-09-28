// command/vps/cp.js
// 📋 Copy file

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default {
    name: 'cp',
    aliases: ['copy'],
    category: 'vps',
    description: '📋 Copy file/directory',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length < 2) {
            await react('❌');
            return '❌ *Cara penggunaan:*\n.cp <source> <destination>';
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
            const stat = await fs.stat(sourceFull);
            if (stat.isDirectory()) {
                await fs.cp(sourceFull, destFull, { recursive: true });
            } else {
                await fs.copyFile(sourceFull, destFull);
            }
            const relSource = path.relative(PROJECT_ROOT, sourceFull);
            const relDest = path.relative(PROJECT_ROOT, destFull);
            await react('✅');
            return `✅ *Berhasil dicopy!*\n\n📁 ${relSource} → ${relDest}`;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};