// command/vps/apt.js
// 📦 APT Package Manager

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'apt',
    aliases: ['package'],
    category: 'vps',
    description: '📦 APT package manager',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '📦 *APT Package Manager*\n\n' +
                '📌 *Perintah:*\n' +
                '.apt install <package> - Install package\n' +
                '.apt remove <package> - Hapus package\n' +
                '.apt update - Update package list\n' +
                '.apt upgrade - Upgrade all packages\n\n' +
                '⚠️ *Hanya untuk owner!*'
            );
        }

        const action = args[0].toLowerCase();
        const pkg = args.slice(1).join(' ');

        let command = '';
        let statusText = '';

        if (action === 'install' && pkg) {
            command = `sudo apt install -y ${pkg}`;
            statusText = `📦 Menginstall ${pkg}...`;
        } else if (action === 'remove' && pkg) {
            command = `sudo apt remove -y ${pkg}`;
            statusText = `🗑️ Menghapus ${pkg}...`;
        } else if (action === 'update') {
            command = 'sudo apt update';
            statusText = '🔄 Update package list...';
        } else if (action === 'upgrade') {
            command = 'sudo apt upgrade -y';
            statusText = '⬆️ Upgrading packages...';
        } else {
            await react('❌');
            return '❌ Perintah tidak valid. Gunakan: install, remove, update, upgrade';
        }

        await reply(`⏳ ${statusText}`);

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 300000,
                maxBuffer: 1024 * 1024 * 10
            });

            const output = stdout + stderr;
            const maxChars = 3800;
            let result = `📦 *APT RESULT*\n`;
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