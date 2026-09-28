// command/owner/reduceprem.js
// ➖ Kurangi Durasi Premium User

import premium from '../../lib/premium.js';

export default {
    name: 'reduceprem',
    aliases: ['rprem', 'reducepremium'],
    category: 'owner',
    description: '➖ Kurangi durasi premium user (reply/nomor/@mention)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, quoted, react, reply, mentionedJid } = ctx;

        // ============================================================
        // AMBIL TARGET (PRIORITAS: args → mention → reply)
        // ============================================================

        let target = '';
        let duration = 0;

        // 1️⃣ Cek dari args (nomor manual + durasi)
        if (args && args.length >= 2) {
            const firstArg = args[0];
            if (!firstArg.startsWith('@')) {
                target = firstArg.replace(/\D/g, '');
                duration = parseInt(args[1]);
            }
        }

        // 2️⃣ Cek dari mention (@tag)
        if (!target && mentionedJid && mentionedJid.length > 0) {
            const jid = mentionedJid[0];
            const number = jid.split('@')[0].replace(/\D/g, '');
            if (number && number.length >= 6) {
                target = number;
                // Cari durasi dari args
                for (const arg of (args || [])) {
                    const num = parseInt(arg);
                    if (!isNaN(num) && num > 0) {
                        duration = num;
                        break;
                    }
                }
            }
        }

        // 3️⃣ Cek dari reply
        if (!target && quoted?.sender) {
            const number = quoted.sender.split('@')[0].replace(/\D/g, '');
            if (number && number.length >= 6) {
                target = number;
                if (args && args.length >= 1) {
                    duration = parseInt(args[0]);
                }
            }
        }

        // 4️⃣ Fallback: coba dari args (nomor + durasi)
        if (!target && args && args.length >= 2) {
            target = args[0].replace(/\D/g, '');
            duration = parseInt(args[1]);
        }

        // 5️⃣ Cari durasi jika belum ditemukan
        if (target && !duration) {
            for (const arg of (args || [])) {
                const num = parseInt(arg);
                if (!isNaN(num) && num > 0) {
                    duration = num;
                    break;
                }
            }
        }

        // ============================================================
        // VALIDASI
        // ============================================================

        if (!target || target.length < 6) {
            await react('❌');
            const msg = 
                '➖ *Reduce Premium*\n\n' +
                '❌ Tentukan target!\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '.reduceprem <nomor> <durasi>\n' +
                '.reduceprem <durasi> (reply ke target)\n' +
                '.reduceprem <durasi> @target\n\n' +
                '📌 *Durasi dalam MENIT:*\n' +
                '• 60 = 1 jam\n' +
                '• 1440 = 1 hari\n' +
                '• 10080 = 1 minggu\n' +
                '• 43200 = 1 bulan';
            return msg;
        }

        if (!duration || duration < 1) {
            await react('❌');
            const msg = 
                '❌ Durasi harus berupa angka positif (dalam menit)!\n\n' +
                '📌 *Contoh:*\n' +
                '.reduceprem 6281234567890 60\n' +
                '.reduceprem 60 @6281234567890';
            return msg;
        }

        // ============================================================
        // EKSEKUSI
        // ============================================================

        await react('⏳');

        const result = premium.reducePremium(target, duration);

        if (!result.success) {
            await react('❌');
            return result.message;
        }

        await react('✅');
        return result.message;
    }
};