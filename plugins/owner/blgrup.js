// command/owner/blgrup.js
// ⛔ Blacklist Grup + Nama Grup

import database from '../../lib/database.js';

export default {
    name: 'blgrup',
    aliases: ['blacklistgrup', 'blgc'],
    category: 'owner',
    description: '⛔ Blacklist a group',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, args, sender, isOwner, isGroup, react, reply } = ctx;
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
                '1. Untuk grup saat ini: Ketik `.blgrup` langsung di dalam grup target.\n' +
                '2. Untuk grup lain: `.blgrup 123456789@g.us`'
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
            console.log('[BLGRUP] Gagal ambil nama grup:', e.message);
        }

        if (database.addBlGrup(targetJid)) {
            await react('✅');
            return (
                `⛔ Grup ${groupName} Berhasil Diblacklist! dengan ID: ${targetJid}\n` +
//                `📌 *Nama:* ${groupName}\n` +
//                `🆔 *ID:* ${targetJid}\n\n` +
                `📋 Cek daftar: .listblgrup`
            );
        } else {
            await react('ℹ️');
            return `ℹ️ Grup *${groupName}* dengan ID: (${targetJid}) sudah ada di blacklist.`;
        }
    }
};