// command/owner/listblgrup.js
// 📋 Daftar Blacklist Grup + Nama Grup

import database from '../../lib/database.js';

export default {
    name: 'listblgrup',
    aliases: ['listblacklistgrup', 'listblgc'],
    category: 'owner',
    description: '📋 List blacklisted groups + names',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, react, reply } = ctx;
        await react('⏳');

        const db = database.getBlGrup();
        const groups = db.groups || [];

        if (groups.length === 0) {
            await react('📋');
            return '📋 *Daftar Blacklist Grup*\n\n✅ Belum ada grup yang diblacklist.';
        }

        // Ambil nama grup satu per satu
        let result = `📋 *Daftar Blacklist Grup (${groups.length})*\n\n`;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < groups.length; i++) {
            const jid = groups[i];
            let groupName = '❓ Tidak dikenal';

            try {
                const metadata = await sock.groupMetadata(jid);
                if (metadata && metadata.subject) {
                    groupName = metadata.subject;
                    successCount++;
                }
            } catch (e) {
                groupName = '⚠️ Tidak ditemukan';
                failCount++;
            }

            result += `${i + 1}. ${jid} (${groupName})\n`;
        }

        result += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        result += `📊 ${successCount} ditemukan, ${failCount} tidak ditemukan`;

        await react('✅');
        return result;
    }
};