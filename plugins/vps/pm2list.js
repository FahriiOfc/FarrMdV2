// command/vps/pm2list.js
// 📋 Daftar proses PM2

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'pm2list',
    aliases: ['pm2'],
    category: 'vps',
    description: '📋 List PM2 processes',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

        try {
            const { stdout } = await execAsync('pm2 list --no-color');
            const lines = stdout.split('\n').filter(line => line.trim());
            
            let output = `📋 *PM2 PROCESSES*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += `\`\`\`\n${lines.join('\n')}\n\`\`\``;

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};