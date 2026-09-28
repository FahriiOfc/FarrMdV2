// command/owner/unblgrup.js
// ✅ Unblacklist Grup + Nama Grup

import database from '../../lib/database.js';

export default {
    name: 'unblgrup',
    aliases: ['unblacklistgrup', 'unblgc'],
    category: 'owner',
    description: '✅ Remove group from blacklist',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, args, isGroup, react, reply } = ctx;
        await react('⏳');

        let targetJid = args[0] || '';

        if (!targetJid && isGroup) {
            targetJid = chat;
        }

        if (!targetJid || !targetJid.endsWith('@g.us')) {
            await react('❌');
            return (
                '❌ Target grup tidak valid!\n\n' +
                '📌 *Cara Penggunaan:*\n' +
                '1. Untuk grup saat ini: Ketik `.unblgrup` langsung di dalam grup target.\n' +
                '2. Untuk grup lain: `.unblgrup 123456789@g.us`'
            );
        }

        // Ambil nama grup
        let groupName = '❓ Tidak dikenal';
        try {
            const metadata = await sock.groupMetadata(targetJid);
            if (metadata && metadata.subject) {
                groupName = metadata.subject;
            }
        } catch (e) {
            console.log('[UNBLGRUP] Gagal ambil nama grup:', e.message);
        }

        if (database.removeBlGrup(targetJid)) {
            await react('✅');
            return (
                `✅ *Grup ${groupName} Dengan ID: ${targetJid} Berhasil Dihapus dari Blacklist!*\n` +
//                `📌 *Nama:* ${groupName}\n` +
//                `🆔 *ID:* ${targetJid}\n\n` +
                `Bot akan merespon kembali.`
            );
        } else {
            await react('ℹ️');
            return `ℹ️ Grup *${groupName}* (${targetJid}) tidak ada di blacklist.`;
        }
    }
};