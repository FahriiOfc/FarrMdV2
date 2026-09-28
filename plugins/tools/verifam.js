// command/tools/verifam.js
// 🔑 Verify Alight Motion Link

import { verifyLink } from '../../scraper/alightmotion.js';

export default {
    name: 'verifam',
    aliases: ['verifyam', 'amverify'],
    category: 'tools',
    description: '🔑 Verifikasi link Alight Motion dari email',

    async execute(ctx) {
        const { args, reply, react, sender } = ctx;

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '🔑 *Verify Alight Motion*\n\n' +
                '❌ Masukkan email dan link verifikasi!\n\n' +
                '📌 *Contoh:*\n' +
                '.verifam emailmu@gmail.com | https://link-verifikasi.com'
            );
        }

        const fullText = args.join(' ');
        const match = fullText.match(/^([^|]+)\|(.*)$/);

        if (!match) {
            await react('❌');
            return (
                '🛑 Format salah!\n\n' +
                '📌 *Contoh:*\n' +
                '.verifam emailmu@gmail.com | https://link-verifikasi.com'
            );
        }

        const email = match[1].trim().toLowerCase();
        const link = match[2].trim();

        if (!email.endsWith('@gmail.com')) {
            await react('❌');
            return '🛑 Format email salah! Wajib berakhiran *@gmail.com*';
        }

        if (!/^https?:\/\//i.test(link)) {
            await react('❌');
            return '🛑 Format link salah! Link wajib diawali dengan *https://*';
        }

        await react('⏳');

        try {
            const result = await verifyLink(email, link);

            if (!result || result.status === false) {
                await react('❌');
                return (
                    `🛑 Proses verifikasi gagal!\n\n` +
                    `📩 Email: ${email}\n` +
                    `🔗 Link: ${link}\n\n` +
                    `*Respon Server:* ${result?.message || 'Link tidak valid atau kadaluarsa'}`
                );
            }

            await react('✅');
            return (
                `🔑 *Verify Link Result*\n\n` +
                `📩 *Email:* ${email}\n` +
                `🔗 *Link:* ${link}\n` +
                `✅ *Status:* Verifikasi berhasil diproses!\n\n` +
                `🎉 Selamat! Alight Motion Premium aktif.`
            );

        } catch (error) {
            console.error('[VERIFAM] Error:', error.message);
            await react('❌');
            return `🛑 Error: ${error.message}`;
        }
    }
};