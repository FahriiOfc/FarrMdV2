// command/vps/top.js
// 📈 Proses berjalan (5 teratas)

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'top',
    aliases: ['ps', 'proses'],
    category: 'vps',
    description: '📈 Show top processes',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        let lines = 5;
        if (args.length > 0 && !isNaN(args[0]) && parseInt(args[0]) > 0) {
            lines = parseInt(args[0]);
            if (lines > 20) lines = 20;
        }

        try {
            const { stdout } = await execAsync(`ps aux --sort=-%cpu | head -n ${lines + 1}`);
            const linesArray = stdout.split('\n').filter(line => line.trim());
            
            let output = `📈 *TOP PROCESSES (CPU)*\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += `\`\`\`\n${linesArray.join('\n')}\n\`\`\``;

            await react('✅');
            return output;

        } catch (error) {
            await react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};