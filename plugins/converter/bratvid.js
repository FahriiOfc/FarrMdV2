// command/converter/bratvid.js
// 🎬 Brat Video → Sticker

import axios from 'axios';
import config from '../../config.js';
import media from '../../lib/media.js';

export default {
    name: 'bratvid',
    aliases: ['bratsticker', 'bv'],
    category: 'converter',
    description: '🎬 Buat sticker dari Brat Video',

    async execute(ctx) {
        const { sock, chat, args, react, reply, sender } = ctx;

        // ============================================================
        // CEK TEXT
        // ============================================================

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '🎬 *Brat Video → Sticker*\n\n' +
                '❌ Masukkan teks!\n\n' +
                '📌 *Contoh:*\n' +
                '.bratvid Halo dunia!\n' +
                '.bratvid Selamat pagi 🌅\n\n' +
                '📌 *Alias:* .bv, .bratsticker'
            );
        }

        const text = args.join(' ');

        // Batasi panjang teks (API limit)
        if (text.length > 200) {
            await react('❌');
            return '❌ Teks terlalu panjang! Maksimal 200 karakter.';
        }

        await react('⏳');

        // ============================================================
        // GENERATE VIDEO DARI API
        // ============================================================

        try {
            const apiUrl = `https://api.azbry.com/api/maker/bratvid?text=${encodeURIComponent(text)}`;
            console.log('[BRATVID] Requesting:', apiUrl);

            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const videoBuffer = Buffer.from(response.data);

            if (videoBuffer.length < 1024) {
                await react('❌');
                return '❌ Gagal generate video. Coba lagi nanti.';
            }

            // ============================================================
            // KONVERSI VIDEO → STICKER
            // ============================================================

//            await reply(`🎬 Membuat sticker dari video...\n📝 *${text}*`);

            try {
                const stickerBuffer = await media.toSticker(videoBuffer);

                if (!stickerBuffer || stickerBuffer.length === 0) {
                    await react('❌');
                    return '❌ Gagal membuat sticker. Coba lagi.';
                }

                // ============================================================
                // KIRIM STICKER
                // ============================================================

                await sock.sendMessage(chat, {
                    sticker: stickerBuffer,
                    contextInfo: {
                        mentionedJid: [sender],
                        isForwarded: true,
                        forwardingScore: 999
                    }
                });

                await react('✅');
                return;

            } catch (stickerError) {
                console.error('[BRATVID] Sticker error:', stickerError.message);

                // Fallback: kirim video saja
                await react('⚠️');
                await sock.sendMessage(chat, {
                    video: videoBuffer,
                    caption: `🎬 *Brat Video*\n📝 ${text}`,
                    contextInfo: {
                        mentionedJid: [sender],
                        isForwarded: true,
                        forwardingScore: 999
                    }
                });
                return;
            }

        } catch (error) {
            console.error('[BRATVID] Error:', error.message);
            await react('❌');

            if (error.response?.status === 404) {
                return '❌ API tidak ditemukan. Coba lagi nanti.';
            }

            return `❌ Error: ${error.message}`;
        }
    }
};