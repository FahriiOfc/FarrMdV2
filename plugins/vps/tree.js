// command/vps/tree.js
// 🌳 Struktur folder lengkap

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

export default {
    name: 'tree',
    aliases: ['structure'],
    category: 'vps',
    description: '🌳 Show folder structure',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        let targetPath = PROJECT_ROOT;
        let maxDepth = 3;

        if (args.length > 0) {
            const firstArg = args[0];
            if (!isNaN(firstArg) && parseInt(firstArg) > 0) {
                maxDepth = parseInt(firstArg);
            } else {
                const userPath = args.join(' ');
                const resolved = path.resolve(PROJECT_ROOT, userPath);
                if (resolved.startsWith(PROJECT_ROOT) || resolved.startsWith('/')) {
                    targetPath = resolved;
                } else {
                    await react('❌');
                    return '❌ Akses tidak diizinkan.';
                }
            }
        }

        async function generateTree(dir, prefix = '', depth = 0) {
            if (depth > maxDepth) return '';
            let result = '';
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                const filtered = entries.filter(e => !['node_modules', 'auth', 'temp', '.git'].includes(e.name));
                for (let i = 0; i < filtered.length; i++) {
                    const entry = filtered[i];
                    const isLast = i === filtered.length - 1;
                    const line = `${prefix}${isLast ? '└── ' : '├── '}${entry.name}${entry.isDirectory() ? '/' : ''}\n`;
                    result += line;
                    if (entry.isDirectory()) {
                        const subPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
                        result += await generateTree(path.join(dir, entry.name), subPrefix, depth + 1);
                    }
                }
            } catch (e) {}
            return result;
        }

        try {
            const relativePath = path.relative(PROJECT_ROOT, targetPath) || '.';
            let output = `🌳 *${relativePath}/*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += await generateTree(targetPath);
            output += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            output += `📊 Depth: ${maxDepth} level`;

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};