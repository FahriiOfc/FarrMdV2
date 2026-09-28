// command/vps/pm2restart.js
// 🔄 Restart bot via PM2

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'pm2restart',
    aliases: ['restartbot', 'reboot'],
    category: 'vps',
    description: '🔄 Restart bot via PM2',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

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

            await reply(`⏳ Restarting bot (${processName})...`);

            const { stdout, stderr } = await execAsync(`pm2 restart ${processName}`);

            let output = `🔄 *PM2 RESTART*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += `📌 *Process:* ${processName}\n`;
            output += `✅ *Status:* Restart success\n\n`;
            output += `\`\`\`\n${stdout}\n\`\`\``;

            if (stderr) {
                output += `\n\n⚠️ *Stderr:*\n${stderr}`;
            }

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal restart: ${error.message}`;
        }
    }
};