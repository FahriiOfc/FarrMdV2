// plugins/downloader/tiktokv2.js
// 🎵 TikTok Downloader V2 — AIRich Loading + Carousel Slide
// API: ZaxiusAja

import axios from 'axios';
import config from '../../config.js';
import { AIRich, Carousel } from '../../lib/MessageBuilder.js';

const BOT_NAME = config.botName || 'FarrMdV2';
const API_URL = 'https://api.zaxiusaja.xyz/download/tiktok';
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// HELPER — Log
// ============================================================

function logStep(step, msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[TTV2] [${ts}] Step ${step}: ${msg}`);
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'tiktokv2',
    aliases: ['ttv2', 'tt'],
    category: 'downloader',
    description: '🎵 TikTok (video/slide/mp3) via AIRich',

    async execute(ctx) {
        const { sock, chat, args, quoted, react, sender, message } = ctx;

        await react('⏳');

        // ============================================================
        // PARSE URL & MODE
        // ============================================================

        let url = '';
        let mode = 'auto';

        if (args && args.length > 0) {
            const hasMp3 = args.some(a => a.toLowerCase() === 'mp3');
            if (hasMp3) {
                mode = 'mp3';
                url = args.filter(a => a.toLowerCase() !== 'mp3').join(' ');
            } else {
                url = args.join(' ');
            }
        }

        if (!url && quoted?.text) url = quoted.text;

        if (url) {
            const m = url.match(/(https?:\/\/[^\s]+)/i);
            if (m) url = m[0];
        }

        if (!url) {
            await react('❌');
            return (
                `🎵 *TikTok Downloader V2*\n\n` +
                `❌ Masukkan URL TikTok!\n\n` +
                `📌 *Format:*\n` +
                `• \`.ttv2 <url>\` — Video / Slide\n` +
                `• \`.ttv2 mp3 <url>\` — Audio MP3`
            );
        }

        logStep(1, `URL: ${url}`);

        // ============================================================
        // STEP 1 — KIRIM AIRICH LOADING BUBBLE
        // ============================================================

        const rich = new AIRich(sock);
        rich.setTitle('🎵 TikTok Downloader');
        rich.setFooter(BOT_NAME);
        rich.addText('⏳ *Memproses...*', { id: 'status' });

        let sent;
        try {
            sent = await rich.send(chat, {
                forwarded: true,
                includesUnifiedResponse: true,
                includesSubmessages: true
            });
            logStep(1, `Bubble AIRich terkirim: ${sent.key.id}`);
        } catch (e) {
            logStep(1, `AIRich gagal: ${e.message}`);
            await ctx.reply(`❌ Error AIRich: ${e.message}`);
            return;
        }

        await delay(800);

        // ============================================================
        // STEP 2 — FETCH API
        // ============================================================

        let data;
        try {
            logStep(2, 'Memanggil API ZaxiusAja...');

            rich.addText('⏳ *Mengambil data dari API...*', { replace: 'status', id: 'status' });
            await rich.sendEdit();

            const res = await axios.get(
                `${API_URL}?url=${encodeURIComponent(url)}`,
                { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } }
            );

            if (!res.data?.status || !res.data?.result?.data) {
                throw new Error('API response invalid');
            }

            data = res.data.result.data;
            logStep(2, `Data OK: id=${data.id}`);

            rich.addText('✅ *Data ditemukan!*', { replace: 'status', id: 'status' });
            await rich.sendEdit();

        } catch (error) {
            logStep(2, `API error: ${error.message}`);
            rich.addText(`❌ *Gagal ambil data*\n${error.message}`, { replace: 'status', id: 'status' });
            await rich.sendEdit();
            await react('❌');
            return;
        }

        await delay(500);

        // ============================================================
        // MODE MP3
        // ============================================================

        if (mode === 'mp3') {
            try {
                logStep(3, 'Mode MP3');

                rich.addText('📥 *Download audio...*', { insertAt: 'status', id: 'dl' });
                await rich.sendEdit();

                if (!data.music) throw new Error('Audio tidak tersedia');

                rich.addText('📤 *Mengirim audio...*', { replace: 'dl', id: 'dl' });
                await rich.sendEdit();

                const audioCaption =
                    `🎵 *${data.music_info?.title || data.title || 'Audio'}*\n` +
                    `👤 ${data.music_info?.author || 'Unknown'}\n` +
                    `⏱ ${data.music_info?.duration || 0}s\n\n` +
                    `🛡 ${BOT_NAME}`;

                await sock.sendMessage(chat, {
                    audio: { url: data.music },
                    mimetype: 'audio/mpeg',
                    fileName: `${(data.music_info?.title || 'audio').replace(/[^\w]/g, '_')}.mp3`,
                    contextInfo: {
                        mentionedJid: [sender],
                        isForwarded: true,
                        forwardingScore: 999
                    }
                });

                rich.addText(`✅ *Selesai!*\n\n${audioCaption}`, { replace: 'dl', id: 'dl' });
                await rich.sendEdit();

                logStep(3, 'MP3 selesai');
                await react('✅');

            } catch (error) {
                logStep(3, `MP3 error: ${error.message}`);
                rich.addText(`❌ *Gagal MP3*\n${error.message}`, { replace: 'dl', id: 'dl' });
                await rich.sendEdit();
                await react('❌');
            }
            return;
        }

        // ============================================================
        // MODE SLIDE → CAROUSEL
        // ============================================================

        if (data.images && data.images.length > 0) {
            const total = data.images.length;
            logStep(3, `Mode Slide — ${total} gambar`);

            try {
                rich.addText(`📥 *Download ${total} gambar...*`, { insertAt: 'status', id: 'dl' });
                await rich.sendEdit();

                const images = [];

                for (let i = 0; i < total; i++) {
                    try {
                        logStep(4, `Download gambar ${i + 1}/${total}...`);
                        rich.addText(`📥 *Download ${i + 1}/${total}...*`, { replace: 'dl', id: 'dl' });
                        await rich.sendEdit();

                        const imgRes = await axios.get(data.images[i], {
                            responseType: 'arraybuffer',
                            timeout: 30000,
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        images.push(Buffer.from(imgRes.data));
                        logStep(4, `Gambar ${i + 1} OK (${images[i].length} bytes)`);

                    } catch (e) {
                        logStep(4, `Gambar ${i + 1} GAGAL: ${e.message}`);
                    }
                }

                if (images.length === 0) throw new Error('Tidak ada gambar');

                // Hapus status loading dari AIRich
                rich.delete('dl');
                rich.addText(`✅ *Selesai!* Mengirim ${images.length} gambar...`, { replace: 'status', id: 'status' });
                await rich.sendEdit();

                // Build caption
                const caption =
                    `🎵 *${(data.title || 'TikTok Slide').slice(0, 100)}*\n\n` +
                    `👤 @${data.author?.unique_id || 'Unknown'}\n` +
                    `❤️ ${data.digg_count || 0} | 💬 ${data.comment_count || 0} | 🔗 ${data.share_count || 0}`;

                // Build Carousel
                logStep(5, `Membangun Carousel (${images.length} card)...`);

                const { prepareWAMessageMedia } = await import('@chaeulso/baileys');

                const carousel = new Carousel(sock);
                carousel.setBody(caption);
                carousel.setFooter(BOT_NAME);

                const cards = [];

                for (let i = 0; i < images.length; i++) {
                    const media = await prepareWAMessageMedia(
                        { image: images[i] },
                        { upload: sock.waUploadToServer }
                    );

                    // ✅ Card 1 — pakai caption info
                    // Card 2+ — body kosong
                    const cardBody = i === 0
                        ? `📸 Gambar ${i + 1} dari ${images.length}\n\n${caption}`
                        : '';   // ← kosong untuk card 2+

                    cards.push({
                        header: {
                            title: `Gambar ${i + 1}/${images.length}`,
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        },
                        body: { text: cardBody },
                        footer: { text: BOT_NAME },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '👁 Lihat',
                                    id: `slide_${i + 1}`
                                })
                            }]
                        }
                    });
                }

                carousel.addCard(cards);
                await carousel.send(chat);

                logStep(5, `Carousel terkirim`);
                await react('✅');

            } catch (error) {
                logStep(5, `Slide error: ${error.message}`);
                rich.addText(`❌ *Gagal slide*\n${error.message}`, { replace: 'dl', id: 'dl' });
                await rich.sendEdit();
                await react('❌');
            }
            return;
        }

        // ============================================================
        // MODE VIDEO
        // ============================================================

        try {
            const videoUrl = data.hdplay || data.play || data.wmplay;
            if (!videoUrl) throw new Error('Video URL tidak ada');

            logStep(3, 'Mode Video');
            rich.addText('📥 *Download video...*', { insertAt: 'status', id: 'dl' });
            await rich.sendEdit();

            // Download video
            logStep(4, 'Fetch video buffer...');
            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const videoBuffer = Buffer.from(videoRes.data);
            logStep(4, `Video OK (${videoBuffer.length} bytes)`);

            rich.addText('📤 *Mengirim video...*', { replace: 'dl', id: 'dl' });
            await rich.sendEdit();

            // Build caption
            let caption = `🎵 *${(data.title || 'TikTok Video').slice(0, 100)}*`;
            if (data.duration > 0) {
                const mins = Math.floor(data.duration / 60);
                const secs = Math.floor(data.duration % 60);
                caption += `\n⏱ ${mins}:${secs.toString().padStart(2, '0')}`;
            }
            caption += `\n👤 @${data.author?.unique_id || 'Unknown'}`;
            caption += `\n❤️ ${data.digg_count || 0} | 💬 ${data.comment_count || 0} | 🔗 ${data.share_count || 0}`;
            caption += `\n\n🛡 ${BOT_NAME}`;

            // ✅ SISIPKAN video ke AIRich bubble yang sama
            rich.addText('✅ *Selesai!*', { replace: 'dl', id: 'dl' });
            await rich.sendEdit();

            await delay(300);

            // Video via addVideo (URL)
            rich.addVideo(videoUrl, {
                autoFill: false,
                status: 'READY',
                insertAt: 'dl',
                id: 'video'
            });
            await rich.sendEdit();

            logStep(4, 'Video disisipkan');

            await delay(300);

            // Caption
            rich.addText(caption, { insertAt: 'video', id: 'caption' });
            await rich.sendEdit();

            logStep(5, 'Video selesai');
            await react('✅');

        } catch (error) {
            logStep(5, `Video error: ${error.message}`);
            rich.addText(`❌ *Gagal video*\n${error.message}`, { replace: 'dl', id: 'dl' });
            await rich.sendEdit();
            await react('❌');
        }
    }
};