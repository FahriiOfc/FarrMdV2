// command/downloader/ig.js
// 📸 Instagram Downloader - KyzoRohan API + Progress Bar (Edit Message)

import axios from 'axios';
import config from '../../config.js';

// ============================================================
// DELAY HELPER
// ============================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// PROGRESS BAR
// ============================================================

function getProgressBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '▰'.repeat(filled) + '▱'.repeat(empty);
}

export default {
    name: 'ig',
    aliases: ['instagram', 'igdl'],
    category: 'downloader',
    description: '📸 Download Instagram post/reel/story',

    async execute(ctx) {
        const { sock, chat, args, quoted, react, reply, sender } = ctx;

        // ============================================================
        // AMBIL URL
        // ============================================================

        let url = '';

        if (args && args.length > 0) {
            url = args.join(' ').trim();
        } else if (quoted?.text) {
            url = quoted.text.trim();
        }

        const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch) {
            url = urlMatch[0];
        }

        if (!url || !url.includes('instagram.com')) {
            await react('❌');
            return (
                '📸 *Instagram Downloader*\n\n' +
                '❌ Masukkan link Instagram!\n\n' +
                '📌 *Contoh:*\n' +
                '.ig https://www.instagram.com/p/xxxxx/\n' +
                '.ig https://www.instagram.com/reel/xxxxx/'
            );
        }

        await react('⏳');

        // ============================================================
        // KIRIM PESAN PROGRESS AWAL (0%)
        // ============================================================

        const sent = await sock.sendMessage(chat, {
            text: `📸 *Instagram Downloader*\n\n` +
                  `⏳ Memproses link...\n` +
                  `${getProgressBar(0)} 0%\n\n` +
                  `📤 Mengirim 1 media...`
        });

        await delay(1500);

        // ============================================================
        // UPDATE PROGRESS 20%
        // ============================================================

        await sock.sendMessage(chat, {
            text: `📸 *Instagram Downloader*\n\n` +
                  `⏳ Mengambil data dari server...\n` +
                  `${getProgressBar(20)} 20%\n\n` +
                  `📤 Mengirim 1 media...`,
            edit: sent.key
        });

        await delay(1500);

        // ============================================================
        // PANGGIL API
        // ============================================================

        try {
            const apiUrl = `https://kyzorohan.web.id/api/instagram?url=${encodeURIComponent(url)}&key=${config.kyzorohanApiKey}`;
            console.log('[IG] Requesting:', apiUrl);

            const response = await axios.get(apiUrl, {
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // ============================================================
            // UPDATE PROGRESS 40%
            // ============================================================

            await sock.sendMessage(chat, {
                text: `📸 *Instagram Downloader*\n\n` +
                      `⏳ Menganalisis data...\n` +
                      `${getProgressBar(40)} 40%\n\n` +
                      `📤 Mengirim 1 media...`,
                edit: sent.key
            });

            await delay(1500);

            const data = response.data;

            if (!data.status || !data.result || !data.result.success) {
                await react('❌');
                await sock.sendMessage(chat, {
                    text: `❌ Gagal: ${data.message || 'Unknown error'}`,
                    edit: sent.key
                });
                return;
            }

            const result = data.result;
            const postInfo = result.postInfo || {};
            const mediaItems = result.mediaItems || [];

            if (mediaItems.length === 0) {
                await react('❌');
                await sock.sendMessage(chat, {
                    text: '❌ Tidak ada media yang ditemukan. Coba URL lain.',
                    edit: sent.key
                });
                return;
            }

            // ============================================================
            // KUMPULKAN MEDIA
            // ============================================================

            const mediaList = [];
            for (const item of mediaItems) {
                if (item.url && item.url.startsWith('http')) {
                    mediaList.push({
                        type: item.type || 'video',
                        url: item.url,
                        thumbnail: item.thumbnail || null
                    });
                }
            }

            if (mediaList.length === 0) {
                await react('❌');
                await sock.sendMessage(chat, {
                    text: '❌ Tidak ada media yang ditemukan. Coba URL lain.',
                    edit: sent.key
                });
                return;
            }

            // ============================================================
            // UPDATE PROGRESS 60%
            // ============================================================

            await sock.sendMessage(chat, {
                text: `📸 *Instagram Downloader*\n\n` +
                      `⏳ Menyiapkan ${mediaList.length} media...\n` +
                      `${getProgressBar(60)} 60%\n\n` +
                      `📤 Mengirim ${mediaList.length} media...`,
                edit: sent.key
            });

            await delay(1500);

            // ============================================================
            // BUILD CAPTION
            // ============================================================

            const username = postInfo.ownerUsername || 'Unknown';
            const captionText = postInfo.caption || '';
            const likes = postInfo.likes || 0;
            const comments = postInfo.commentCount || postInfo.comments || 0;
            const shares = postInfo.shareCount || postInfo.shares || 0;

            // ============================================================
            // KIRIM MEDIA
            // ============================================================

            let sentCount = 0;
            for (let i = 0; i < mediaList.length; i++) {
                const media = mediaList[i];
                
                // Update progress per media
                const progress = 60 + Math.round(((i + 1) / mediaList.length) * 40);
                
                await sock.sendMessage(chat, {
                    text: `📸 *Instagram Downloader*\n\n` +
                          `⏳ Mengunduh media ${i + 1}/${mediaList.length}...\n` +
                          `${getProgressBar(progress)} ${progress}%\n\n` +
                          `📤 Mengirim ${mediaList.length} media...`,
                    edit: sent.key
                });

                await delay(1500);

                try {
                    if (!media.url || media.url === '-') continue;

                    const mediaResponse = await axios.get(media.url, {
                        responseType: 'arraybuffer',
                        timeout: 60000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const buffer = Buffer.from(mediaResponse.data);

                    // ============================================================
                    // BUILDCAPTION MEDIA
                    // ============================================================

                    let mediaCaption = `📸 *Instagram Downloader*\n\n`;
                    mediaCaption += `👤 *${username}*\n`;
                    mediaCaption += `❤️ ${likes}  💬 ${comments}  🔗 ${shares}  📊 ${mediaList.length} media\n`;

                    if (captionText) {
                        mediaCaption += `\n📝 ${captionText}`;
                    }

                    if (mediaList.length > 1) {
                        mediaCaption += `\n\n📌 *${i + 1}/${mediaList.length}*`;
                    }

                    // Kirim media
                    if (media.type === 'video') {
                        await sock.sendMessage(chat, {
                            video: buffer,
                            caption: mediaCaption,
                            contextInfo: {
                                mentionedJid: [sender],
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        });
                    } else {
                        await sock.sendMessage(chat, {
                            image: buffer,
                            caption: mediaCaption,
                            contextInfo: {
                                mentionedJid: [sender],
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        });
                    }
                    sentCount++;
                } catch (mediaError) {
                    console.log('[IG] Media error:', mediaError.message);
                }
            }

            // ============================================================
            // UPDATE PROGRESS 100%
            // ============================================================

            await sock.sendMessage(chat, {
                text: `📸 *Instagram Downloader*\n\n` +
                      `✅ Selesai!\n` +
                      `${getProgressBar(100)} 100%\n\n` +
                      `📤 ${sentCount} media berhasil dikirim.`,
                edit: sent.key
            });

            if (sentCount === 0) {
                await react('❌');
                return;
            }

            await react('✅');

        } catch (error) {
            console.error('[IG] Error:', error.message);
            await react('❌');

            await sock.sendMessage(chat, {
                text: `❌ Error: ${error.message}`,
                edit: sent.key
            });
        }
    }
};