// command/vps/npm.js
// 📦 NPM Package Manager

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'npm',
    aliases: ['npmpkg'],
    category: 'vps',
    description: '📦 NPM package manager',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '📦 *NPM Package Manager*\n\n' +
                '📌 *Perintah:*\n' +
                '.npm install <package> - Install package\n' +
                '.npm uninstall <package> - Hapus package\n' +
                '.npm update - Update all packages\n\n' +
                '⚠️ *Hanya untuk owner!*'
            );
        }

        const action = args[0].toLowerCase();
        const pkg = args.slice(1).join(' ');

        let command = '';
        let statusText = '';

        if (action === 'install' && pkg) {
            command = `npm install ${pkg}`;
            statusText = `📦 Menginstall ${pkg}...`;
        } else if (action === 'uninstall' && pkg) {
            command = `npm uninstall ${pkg}`;
            statusText = `🗑️ Menghapus ${pkg}...`;
        } else if (action === 'update') {
            command = 'npm update';
            statusText = '🔄 Update packages...';
        } else {
            await react('❌');
            return '❌ Perintah tidak valid. Gunakan: install, uninstall, update';
        }

        await reply(`⏳ ${statusText}`);

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 300000,
                maxBuffer: 1024 * 1024 * 10
            });

            const output = stdout + stderr;
            const maxChars = 3800;
            let result = `📦 *NPM RESULT*\n`;
            result += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            result += `📌 *Command:* \`${command}\`\n\n`;

            if (output.length > maxChars) {
                result += output.slice(0, maxChars - 200);
                result += `\n\n... (${output.length - maxChars + 200} karakter terpotong)`;
            } else {
                result += output;
            }

            await react('✅');
            return result;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};