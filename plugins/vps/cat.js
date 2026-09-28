// command/vps/cat.js
// 📄 Lihat isi file (Full VPS)

import fs from 'fs/promises';
import path from 'path';
import vpsHelper from '../../lib/vpsHelper.js';

export default {
    name: 'cat',
    aliases: ['view', 'lihat'],
    category: 'vps',
    description: '📄 View file content (Full VPS)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return '❌ *Cara penggunaan:*\n.cat <path/file.js>';
        }

        try {
            const userPath = args.join(' ');
            const fullPath = vpsHelper.resolveVPSSafePath(userPath);

            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                await react('❌');
                return `❌ ${userPath} adalah direktori, bukan file.`;
            }

            if (stat.size > 1024 * 50) {
                await react('❌');
                return `❌ File terlalu besar (${(stat.size/1024).toFixed(1)} KB). Maksimal 50KB.`;
            }

            const content = await fs.readFile(fullPath, 'utf8');
            const maxChars = 3800;
            const lines = content.split('\n').length;

            let output = `📄 *${path.basename(fullPath)}*\n`;
            output += `📊 ${lines} lines | 📦 ${(stat.size/1024).toFixed(1)} KB\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (content.length > maxChars) {
                output += content.slice(0, maxChars - 200);
                output += `\n\n... (${content.length - maxChars + 200} karakter terpotong)`;
            } else {
                output += content;
            }

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};