// command/vps/df.js
// 💾 Usage disk

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'df',
    aliases: ['disk'],
    category: 'vps',
    description: '💾 Show disk usage',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

        try {
            const { stdout } = await execAsync('df -h');
            const lines = stdout.split('\n').filter(line => line.trim());
            
            let output = `💾 *DISK USAGE*\n`;
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