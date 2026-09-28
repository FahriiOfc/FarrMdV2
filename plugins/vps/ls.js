// command/vps/ls.js
// 📂 Lihat daftar file/direktori (Full VPS)

import fs from 'fs/promises';
import path from 'path';
import vpsHelper from '../../lib/vpsHelper.js';

export default {
    name: 'ls',
    aliases: ['dir'],
    category: 'vps',
    description: '📂 List files and directories (Full VPS)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react } = ctx;
        await react('⏳');

        try {
            const userPath = args.length > 0 ? args.join(' ') : '';
            const targetPath = vpsHelper.resolveVPSSafePath(userPath);

            const entries = await fs.readdir(targetPath, { withFileTypes: true });
            const folders = entries.filter(e => e.isDirectory()).map(e => e.name);
            const files = entries.filter(e => e.isFile()).map(e => e.name);

            let output = `📂 *${targetPath}/*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (folders.length > 0) {
                output += '📁 *Folders:*\n';
                for (const folder of folders.sort()) {
                    output += `  📁 ${folder}/\n`;
                }
                output += '\n';
            }

            if (files.length > 0) {
                output += '📄 *Files:*\n';
                for (const file of files.sort()) {
                    const stat = await fs.stat(path.join(targetPath, file));
                    const sizeKB = (stat.size / 1024).toFixed(1);
                    output += `  📄 ${file} (${sizeKB} KB)\n`;
                }
                output += '\n';
            }

            output += `━━━━━━━━━━━━━━━━━━━━\n`;
            output += `📊 Total: ${folders.length} folders, ${files.length} files`;

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};