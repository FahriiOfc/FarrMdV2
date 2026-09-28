// command/tools/sendverifam.js
// 📧 Send Alight Motion Verification Link

import { sendVerification } from '../../scraper/alightmotion.js';

export default {
    name: 'sendverifam',
    aliases: ['sendam', 'verifmail'],
    category: 'tools',
    description: '📧 Kirim link verifikasi Alight Motion ke email',

    async execute(ctx) {
        const { args, reply, react, sender } = ctx;

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '📧 *Send Verification Alight Motion*\n\n' +
                '❌ Masukkan email tujuan!\n\n' +
                '📌 *Contoh:*\n' +
                '.sendverifam emailmu@gmail.com'
            );
        }

        const email = args[0].trim().toLowerCase();

        if (!email.endsWith('@gmail.com')) {
            await react('❌');
            return '🛑 Format email salah! Wajib berakhiran *@gmail.com*';
        }

        await react('⏳');

        try {
            const result = await sendVerification(email);

            if (!result || result.status === false) {
                await react('❌');
                return (
                    `🛑 Gagal mengirim link verifikasi!\n\n` +
                    `📩 Email: ${email}\n` +
                    `*Respon Server:* ${result?.message || 'Terjadi kesalahan'}`
                );
            }

            await react('✅');
            return (
                `📧 *Send Verification Link*\n\n` +
                `📩 *Email Target:* ${email}\n` +
                `✅ *Status:* Berhasil dikirim!\n\n` +
                `📌 Cek inbox/spam Gmail Anda.\n` +
                `🔑 Gunakan .verifam untuk verifikasi.`
            );

        } catch (error) {
            console.error('[SENDVERIFAM] Error:', error.message);
            await react('❌');
            return `🛑 Error: ${error.message}`;
        }
    }
};