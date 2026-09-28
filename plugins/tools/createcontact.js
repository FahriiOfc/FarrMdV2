// command/tools/createcontact.js

import config from '../../config.js';

export default {
    name: 'createcontact',
    aliases: ['addcontact', 'newcontact', 'cc', 'savecontact'],
    category: 'tools',
    description: 'Create vCard contact from phone number',

    async execute(ctx) {
        const { sock, chat, sender, args, reply } = ctx;
        await ctx.react('⏳');

        // ============================================================
        // PARSE ARGUMEN
        // ============================================================

        if (!args || args.length < 2) {
            await ctx.react('❌');
            return (
                '❌ *Cara Penggunaan:*\n\n' +
                `.createcontact <nomor> <nama>\n\n` +
                '📌 *Contoh:*\n' +
                `.createcontact 628123456789 Ahmad\n` +
                `.createcontact 628987654321 Budi Santoso\n` +
                `.createcontact 447911123456 John Doe\n\n` +
                '📱 *Support semua format nomor:*\n' +
                '• Indonesia: 628xxxx\n' +
                '• Internasional: 447xxx (UK), 1xxx (US), dll.'
            );
        }

        // ============================================================
        // EKSTRAK NOMOR & NAMA
        // ============================================================

        const rawNumber = args[0];
        const name = args.slice(1).join(' ');

        // Bersihkan nomor (hanya angka)
        const number = String(rawNumber).replace(/\D/g, '');

        if (!number || number.length < 6) {
            await ctx.react('❌');
            return '❌ Nomor tidak valid! Minimal 6 digit angka.';
        }

        if (!name || name.length === 0) {
            await ctx.react('❌');
            return '❌ Nama tidak boleh kosong!';
        }

        const botName = config.botName || 'FarrMdV1';

        // ============================================================
        // BUAT VCARD
        // ============================================================

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
N:${name};;;;
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD`;

        // ============================================================
        // KIRIM KONTAK
        // ============================================================

        try {
            await sock.sendMessage(chat, {
                contacts: {
                    displayName: name,
                    contacts: [{
                        vcard: vcard
                    }]
                },
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: [sender]
                }
            });

            // ============================================================
            // PESAN KONFIRMASI
            // ============================================================

            await reply(
                `✅ Kontak berhasil dibuat!`
            );
            await ctx.react('✅');
            return;

        } catch (error) {
            console.error('[CREATECONTACT] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal membuat kontak: ${error.message}`;
        }
    }
};