// command/vps/netstat.js
// 🌐 Koneksi jaringan aktif

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'netstat',
    aliases: ['net', 'network'],
    category: 'vps',
    description: '🌐 Show network connections',
    ownerOnly: true,

    async execute(ctx) {
        const { reply, react } = ctx;
        await react('⏳');

        try {
            const { stdout } = await execAsync('netstat -tunap 2>/dev/null | head -n 20');
            const lines = stdout.split('\n').filter(line => line.trim());
            
            let output = `🌐 *NETWORK CONNECTIONS*\n`;
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