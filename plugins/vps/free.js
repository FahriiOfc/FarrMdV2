// command/vps/free.js
// 🧠 RAM usage

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'free',
    aliases: ['ram', 'memory'],
    category: 'vps',
    description: '🧠 Show RAM usage',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

        try {
            const { stdout } = await execAsync('free -h');
            const lines = stdout.split('\n').filter(line => line.trim());
            
            let output = `🧠 *RAM USAGE*\n`;
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