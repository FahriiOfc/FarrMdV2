// command/downloader/ttmp3.js
// 🎵 TikTok MP3 Downloader - Khusus Audio

import axios from 'axios';
import config from '../../config.js';

export default {
    name: 'ttmp3',
    aliases: ['ttmp3'],
    category: 'downloader',
    description: '🎵 Download audio MP3 dari TikTok',

    async execute(ctx) {
        const { sock, chat, args, quoted, react, sender, sendWithForward, message } = ctx;

        const botName = config.botName || 'FarrMdV1';

        // ============================================================
        // AMBIL URL
        // ============================================================

        let url = args.join(' ') || '';

        if (!url && quoted?.text) {
            url = quoted.text;
        }

        if (url) {
            const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
            if (urlMatch) {
                url = urlMatch[0];
            }
        }

        if (!url) {
            await react('❌');
            return (
                '🎵 *TikTok MP3 Downloader*\n\n' +
                '❌ Masukkan URL TikTok!\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '.ttmp3 <url>\n\n' +
                'Contoh:\n' +
                '.ttmp3 https://vt.tiktok.com/xxx'
            );
        }

        await react('⏳');

        try {
            // ============================================================
            // PANGGIL API AZBRY (untuk MP3)
            // ============================================================

            const response = await axios.get(
                `https://api.azbry.com/api/download/tiktokslide?url=${encodeURIComponent(url)}`,
                {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            if (!response.data || response.data.status !== true || !response.data.result) {
                await react('❌');
                return '❌ Gagal mengambil audio. Coba URL lain.';
            }

            const result = response.data.result;

            if (!result.music) {
                await react('❌');
                return '❌ Tidak ada audio ditemukan.';
            }

            // ============================================================
            // KIRIM MP3
            // ============================================================

            const caption = `🎵 *${result.music_title || 'TikTok Audio'}*\n\n🛡️ ${botName}`;

            await sock.sendMessage(chat, {
                audio: { url: result.music },
                mimetype: 'audio/mpeg',
                fileName: `${result.music_title || 'audio'}.mp3`,
                caption: caption,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999
                }
            }, { quoted: message });

            await react('✅');

        } catch (error) {
            console.error('[TTMP3] Error:', error.message);
            await react('❌');
            await sendWithForward(`❌ ${error.message || 'Gagal mengunduh'}`, {
                mentions: [sender]
            });
        }
    }
};