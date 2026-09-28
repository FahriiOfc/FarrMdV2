// command/vps/pm2stop.js
// ⏹️ Stop bot via PM2

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'pm2stop',
    aliases: ['stopbot', 'halt'],
    category: 'vps',
    description: '⏹️ Stop bot via PM2',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

        try {
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

            await reply(`⏹️ Stopping bot (${processName})...`);

            const { stdout, stderr } = await execAsync(`pm2 stop ${processName}`);

            let output = `⏹️ *PM2 STOP*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += `📌 *Process:* ${processName}\n`;
            output += `✅ *Status:* Stopped\n\n`;
            output += `\`\`\`\n${stdout}\n\`\`\``;

            if (stderr) {
                output += `\n\n⚠️ *Stderr:*\n${stderr}`;
            }

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal stop: ${error.message}`;
        }
    }
};