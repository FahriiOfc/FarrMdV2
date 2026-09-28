// command/vps/pm2logs.js
// 📜 Log PM2

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'pm2logs',
    aliases: ['logs', 'log'],
    category: 'vps',
    description: '📜 Show PM2 logs',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        let lines = 30;
        if (args.length > 0 && !isNaN(args[0]) && parseInt(args[0]) > 0) {
            lines = parseInt(args[0]);
            if (lines > 200) lines = 200;
        }

        try {
            // Cari nama proses
            let processName = 'FarrMdV1';
            try {
                const { stdout } = await execAsync('pm2 list --no-color');
                const linesArray = stdout.split('\n');
                for (const line of linesArray) {
                    if (line.includes('index.js') || line.includes('FarrMdV1')) {
                        const parts = line.split('│').map(s => s.trim());
                        if (parts.length > 3) {
                            processName = parts[2] || 'FarrMdV1';
                            break;
                        }
                    }
                }
            } catch {}

            const { stdout } = await execAsync(`pm2 logs ${processName} --lines ${lines} --nostream --raw`);

            let logText = stdout;
            logText = logText
                .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
                .replace(/\[\d{2}:\d{2}:\d{2} (AM|PM)\]?/g, '')
                .replace(/[^\x20-\x7E\n]/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            const maxChars = 3800;
            let output = `📜 *PM2 LOGS (${processName})*\n`;
            output += `📊 ${logText.split('\n').length} lines\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (logText.length > maxChars) {
                output += logText.slice(0, maxChars - 200);
                output += `\n\n... (${logText.length - maxChars + 200} karakter terpotong)`;
            } else {
                output += logText;
            }

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};