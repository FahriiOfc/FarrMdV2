// command/vps/exec.js
// ⚡ Jalankan perintah shell

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'exec',
    aliases: ['shell', 'cmd'],
    category: 'vps',
    description: '⚡ Execute shell command',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '⚡ *Execute Command*\n\n' +
                '❌ Masukkan perintah!\n\n' +
                '📌 *Contoh:*\n' +
                '.exec pm2 list\n' +
                '.exec ls -la\n' +
                '.exec whoami'
            );
        }

        const command = args.join(' ');

        // Blacklist command berbahaya
        const dangerous = ['rm -rf', 'dd ', 'mkfs', 'shutdown', 'reboot', 'halt', ':(){ :|:& };:'];
        for (const pattern of dangerous) {
            if (command.includes(pattern)) {
                await react('❌');
                return '❌ Perintah berbahaya tidak diizinkan!';
            }
        }

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 30000,
                maxBuffer: 1024 * 1024 * 5
            });

            const output = stdout + stderr;
            const maxChars = 3800;

            let result = `⚡ *EXEC RESULT*\n`;
            result += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            result += `📌 *Command:* \`${command}\`\n\n`;

            if (!output || output.length === 0) {
                result += '✅ Perintah berhasil dijalankan (tidak ada output).';
            } else if (output.length > maxChars) {
                result += output.slice(0, maxChars - 200);
                result += `\n\n... (${output.length - maxChars + 200} karakter terpotong)`;
            } else {
                result += output;
            }

            await react('✅');
            return result;

        } catch (error) {
            await react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};