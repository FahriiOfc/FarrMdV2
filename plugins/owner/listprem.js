// command/owner/listprem.js
// 📋 Daftar Premium User

import premium from '../../lib/premium.js';

export default {
    name: 'listprem',
    aliases: ['listpremium', 'premlist'],
    category: 'owner',
    description: '📋 Daftar semua user premium',
    ownerOnly: true,

    async execute(ctx) {
        const { react, reply } = ctx;

        await react('⏳');

        const stats = premium.getStats();
        const list = stats.list;

        if (list.length === 0) {
            await react('✅');
            return '📋 *Premium List*\n\nTidak ada user premium.';
        }

        let text = `📋 *Premium List*\n━━━━━━━━━━━━━━━━━━━━\n`;
        text += `👥 Total: ${list.length} user\n\n`;

        for (let i = 0; i < list.length; i++) {
            const user = list[i];
            const remaining = user.remaining || '0 menit';
            
            text += `${i + 1}. +${user.number}\n`;
            text += `   ⏱️ Sisa: ${remaining}\n`;
            text += `   👑 Oleh: +${user.addedBy}\n`;
            
            if (i < list.length - 1) text += `\n`;
        }

        text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        text += `💡 Ketik .delprem <nomor> untuk hapus`;

        await react('✅');
        return text;
    }
};