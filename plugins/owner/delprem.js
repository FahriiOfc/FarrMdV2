// command/owner/delprem.js
// ➖ Hapus Premium User

import premium from '../../lib/premium.js';

export default {
    name: 'delprem',
    aliases: ['delpremium', 'removeprem'],
    category: 'owner',
    description: '➖ Hapus user premium (reply/nomor/@mention)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, quoted, react, reply, mentionedJid } = ctx;

        // ============================================================
        // AMBIL TARGET (PRIORITAS: args → mention → reply)
        // ============================================================

        let target = '';

        // 1️⃣ Cek dari args (nomor manual)
        if (args && args.length > 0) {
            const firstArg = args[0];
            if (!firstArg.startsWith('@')) {
                target = firstArg.replace(/\D/g, '');
            }
        }

        // 2️⃣ Cek dari mention (@tag) - PERBAIKAN
        if (!target && mentionedJid && mentionedJid.length > 0) {
            const jid = mentionedJid[0];
            const number = jid.split('@')[0].replace(/\D/g, '');
            if (number && number.length >= 6) {
                target = number;
            }
        }

        // 3️⃣ Cek dari reply
        if (!target && quoted?.sender) {
            const number = quoted.sender.split('@')[0].replace(/\D/g, '');
            if (number && number.length >= 6) {
                target = number;
            }
        }

        // 4️⃣ Fallback: coba ambil dari args (tanpa filter @)
        if (!target && args && args.length > 0) {
            target = args[0].replace(/\D/g, '');
        }

        // ============================================================
        // VALIDASI
        // ============================================================

        if (!target || target.length < 6) {
            await react('❌');
            const msg = 
                '➖ *Del Premium*\n\n' +
                '❌ Tentukan target!\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '.delprem <nomor>\n' +
                '.delprem (reply ke target)\n' +
                '.delprem @target\n\n' +
                '📌 *Contoh:*\n' +
                '.delprem 6281234567890\n' +
                '(reply ke pesan target) .delprem';
            return msg;
        }

        // ============================================================
        // EKSEKUSI
        // ============================================================

        await react('⏳');

        const result = premium.removePremium(target);

        if (!result.success) {
            await react('❌');
            return result.message;
        }

        await react('✅');
        return result.message;
    }
};