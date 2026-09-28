// command/downloader/yt.js
// 📥 YouTube Downloader - Tanpa Session (FIXED)

import axios from 'axios';

const API_BASE = 'https://api.zaxiusaja.xyz/download/youtube';

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function downloadThumbnail(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.log('[YT] Thumbnail error:', error.message);
        return null;
    }
}

function encodeData(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
}

function decodeData(encoded) {
    try {
        return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    } catch {
        return null;
    }
}

// ============================================================
// DOWNLOAD BUFFER (HELPER)
// ============================================================

async function downloadBuffer(url, timeout = 120000) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Range': 'bytes=0-'
        }
    });
    return Buffer.from(response.data);
}

export default {
    name: 'yt',
    aliases: ['youtube', 'ytdl'],
    category: 'downloader',
    description: '📥 Download YouTube (video/audio)',

    async execute(ctx) {
        const { sock, chat, args, react, reply, sender, quoted } = ctx;

        try {
            console.log('[YT] ===== START =====');

            // ============================================================
            // AMBIL URL & PARAMETER
            // ============================================================

            let url = '';
            let format = 'list';
            let quality = '360';
            let asDoc = false;
            let showFull = false;
            let downloadAll = false;

            if (args && args.length > 0) {
                for (const arg of args) {
                    if (arg.startsWith('http://') || arg.startsWith('https://')) {
                        url = arg;
                    } else if (arg === 'mp3' || arg === 'audio') {
                        format = 'mp3';
                    } else if (arg === 'mp4' || arg === 'video') {
                        format = 'mp4';
                    } else if (arg === 'doc' || arg === 'document') {
                        asDoc = true;
                        format = 'mp4';
                    } else if (arg === 'full' || arg === 'listall') {
                        showFull = true;
                    } else if (arg === 'all' || arg === 'semua') {
                        downloadAll = true;
                    } else if (['144', '240', '360', '480', '720', '1080', '1440', '2160'].includes(arg)) {
                        quality = arg;
                    }
                }
            }

            if (!url && quoted?.text) {
                const quotedText = quoted.text;
                const urlMatch = quotedText.match(/(https?:\/\/[^\s]+)/i);
                if (urlMatch) url = urlMatch[0];
            }

            console.log('[YT] URL:', url);
            console.log('[YT] Format:', format);
            console.log('[YT] Quality:', quality);

            if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
                await react('❌');
                return (
                    '📥 *YouTube Downloader*\n\n' +
                    '❌ Masukkan URL YouTube!\n\n' +
                    '📌 *Format:*\n' +
                    '.yt <url> \n' +
                    '.yt <url> mp3\n' +
                    '.yt <url> mp4 720\n' +
                    '.yt <url> doc 720\n' +
                    '.yt <url> full\n\n' +
                    '📌 *Example:*\n' +
                    '.yt https://youtu.be/xxx mp4 1080\n' +
                    '.yt https://youtu.be/xxx doc 720'
                );
            }

            await react('⏳');

            // ============================================================
            // PANGGIL API
            // ============================================================

            let response;
            const cleanUrl = url.split('?')[0];

            try {
                response = await axios.get(
                    `${API_BASE}?url=${encodeURIComponent(cleanUrl)}`,
                    {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    }
                );
            } catch (apiError) {
                console.log('[YT] API Error:', apiError.message);
                await react('❌');
                return `❌ Gagal menghubungi API: ${apiError.message}`;
            }

            const data = response.data;

            if (!data.status || !data.result) {
                await react('❌');
                return `❌ Gagal: ${data.message || 'Unknown error'}`;
            }

            const result = data.result;
            const title = result.title || 'YouTube';
            const duration = formatDuration(result.duration);
            const thumbnail = result.thumbnail;

            const videos = result.videos || [];
            const audios = result.audios || [];

            const validVideos = videos.filter(v => v.url && v.quality);
            const validAudios = audios.filter(a => a.url && a.quality);

            console.log('[YT] Videos:', validVideos.length);
            console.log('[YT] Audios:', validAudios.length);

            if (validVideos.length === 0 && validAudios.length === 0) {
                await react('❌');
                return '❌ Tidak ada media yang tersedia.';
            }

            // ============================================================
            // FULL FORMAT
            // ============================================================

            if (showFull) {
                let fullText = `📋 *FULL FORMAT - ${title}*\n`;
                fullText += `⏱️ ${duration}\n━━━━━━━━━━━━━━━━━━━━\n\n`;

                if (validVideos.length > 0) {
                    fullText += `📹 *VIDEO (${validVideos.length}):*\n`;
                    for (const v of validVideos) {
                        fullText += `  🎬 ${v.quality || v.label || 'Video'} (${v.ext || 'mp4'})\n`;
                    }
                    fullText += '\n';
                }

                if (validAudios.length > 0) {
                    fullText += `🎵 *AUDIO (${validAudios.length}):*\n`;
                    for (const a of validAudios) {
                        fullText += `  🎵 ${a.quality || a.label || 'Audio'} (${a.ext || 'mp3'})\n`;
                    }
                    fullText += '\n';
                }

                fullText += `━━━━━━━━━━━━━━━━━━━━\n`;
                fullText += `💡 .yt ${cleanUrl} mp3 - Download audio\n`;
                fullText += `💡 .yt ${cleanUrl} mp4 720 - Download video 720p`;

                await react('✅');
                return fullText;
            }

            // ============================================================
            // DOWNLOAD ALL (FIX - PAKAI BUFFER)
            // ============================================================

            if (downloadAll) {
                const bestVideo = validVideos[validVideos.length - 1];
                const bestAudio = validAudios.find(a => a.quality === 'm4a (131kb/s)') || 
                                  validAudios.find(a => a.quality === 'opus (138kb/s)') ||
                                  validAudios[0];

                if (!bestVideo || !bestAudio) {
                    await react('❌');
                    return '❌ Tidak ada media yang tersedia.';
                }

                try {
                    // ✅ Download video
                    const videoBuffer = await downloadBuffer(bestVideo.url);
                    
                    await sock.sendMessage(chat, {
                        video: videoBuffer,
                        caption: `🎬 *${title}*\n⏱️ ${duration} | 📊 ${bestVideo.quality || 'Best'}`,
                        contextInfo: {
                            mentionedJid: [sender],
                            isForwarded: true,
                            forwardingScore: 999
                        }
                    });

                    // ✅ Download audio
                    const audioBuffer = await downloadBuffer(bestAudio.url);

                    await sock.sendMessage(chat, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            mentionedJid: [sender],
                            isForwarded: true,
                            forwardingScore: 999
                        }
                    });

                    await react('✅');
                    return `✅ *${title}*\n📹 Video + 🎵 Audio berhasil dikirim!`;

                } catch (error) {
                    console.error('[YT] Download all error:', error.message);
                    await react('❌');
                    return `❌ Gagal download: ${error.message}`;
                }
            }

            // ============================================================
            // DOWNLOAD MP3 (FIX - PAKAI BUFFER)
            // ============================================================

            if (format === 'mp3') {
                const bestAudio = validAudios.find(a => a.quality === 'm4a (131kb/s)') || 
                                  validAudios.find(a => a.quality === 'opus (138kb/s)') ||
                                  validAudios[0];

                if (!bestAudio) {
                    await react('❌');
                    return '❌ Tidak ada audio yang tersedia.';
                }

                try {
                    // ✅ DOWNLOAD DULU DI SERVER
                    console.log('[YT] Downloading audio...');
                    const buffer = await downloadBuffer(bestAudio.url);

                    if (!buffer || buffer.length === 0) {
                        throw new Error('Buffer kosong');
                    }

                    console.log('[YT] Audio size:', buffer.length);

                    // ✅ KIRIM SEBAGAI BUFFER
                    await sock.sendMessage(chat, {
                        audio: buffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        ptt: false,
                        contextInfo: {
                            mentionedJid: [sender],
                            isForwarded: true,
                            forwardingScore: 999
                        }
                    });

                    await react('✅');
                    return `🎵 *${title}*\n⏱️ ${duration} | 📊 ${bestAudio.quality || 'Audio'}`;

                } catch (error) {
                    console.error('[YT] MP3 Download error:', error.message);
                    await react('❌');
                    return `❌ Gagal download MP3: ${error.message}`;
                }
            }

            // ============================================================
            // DOWNLOAD VIDEO (MP4 atau DOC)
            // ============================================================

            if (format === 'mp4') {
                let selectedVideo = null;

                for (const v of validVideos) {
                    if (v.quality && v.quality.includes(`${quality}p`)) {
                        selectedVideo = v;
                        break;
                    }
                }

                if (!selectedVideo) {
                    selectedVideo = validVideos[validVideos.length - 1];
                }

                if (!selectedVideo) {
                    await react('❌');
                    return '❌ Tidak ada video yang tersedia.';
                }

                const videoUrl = selectedVideo.url;
                const videoQuality = selectedVideo.quality || `${quality}p`;

                try {
                    console.log('[YT] Downloading video...');
                    const buffer = await downloadBuffer(videoUrl, 300000); // 5 menit timeout

                    const caption = `🎬 *${title}*\n⏱️ ${duration} | 📊 ${videoQuality}`;

                    if (asDoc) {
                        await sock.sendMessage(chat, {
                            document: buffer,
                            fileName: `${title}.mp4`,
                            mimetype: 'video/mp4',
                            caption: caption + '\n\n📌 Dikirim sebagai dokumen (tidak dikompres)',
                            contextInfo: {
                                mentionedJid: [sender],
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        });
                    } else {
                        await sock.sendMessage(chat, {
                            video: buffer,
                            caption: caption,
                            contextInfo: {
                                mentionedJid: [sender],
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        });
                    }

                    await react('✅');
                    return;
                } catch (error) {
                    console.error('[YT] Video Download error:', error.message);
                    await react('❌');
                    return `❌ Gagal download: ${error.message}`;
                }
            }

            // ============================================================
            // DEFAULT: TAMPILKAN LIST
            // ============================================================

            let thumbBuffer = null;
            if (thumbnail) {
                thumbBuffer = await downloadThumbnail(thumbnail);
            }

            const infoText = 
                `📥 *YouTube Downloader*\n\n` +
                `📌 *Judul:* ${title}\n` +
                `⏱️ *Durasi:* ${duration}\n` +
                `📊 *Total:* ${validVideos.length} video, ${validAudios.length} audio\n\n` +
                `📋 Pilih format di bawah ini:`;

            if (thumbBuffer) {
                await sock.sendMessage(chat, {
                    image: thumbBuffer,
                    caption: infoText,
                    contextInfo: {
                        mentionedJid: [sender],
                        isForwarded: true,
                        forwardingScore: 999
                    }
                });
            } else {
                await ctx.replyWithForward(infoText);
            }

            const sections = [];

            if (validVideos.length > 0) {
                const videoRows = validVideos.map(v => {
                    const data = {
                        type: 'video',
                        title: title,
                        duration: duration,
                        quality: v.quality || v.label || 'Unknown',
                        url: v.url,
                        ext: v.ext || 'mp4'
                    };
                    const encoded = encodeData(data);
                    return {
                        title: `🎬 ${v.quality || v.label || 'Video'}`,
                        description: v.ext ? `Format: ${v.ext}` : '',
                        id: `yt_${encoded}`
                    };
                });

                sections.push({
                    title: '📹 VIDEO',
                    rows: videoRows.slice(0, 10)
                });
            }

            if (validAudios.length > 0) {
                const audioRows = validAudios.map(a => {
                    const data = {
                        type: 'audio',
                        title: title,
                        duration: duration,
                        quality: a.quality || a.label || 'Audio',
                        url: a.url,
                        ext: a.ext || 'mp3'
                    };
                    const encoded = encodeData(data);
                    return {
                        title: `🎵 ${a.quality || a.label || 'Audio'}`,
                        description: a.ext ? `Format: ${a.ext}` : '',
                        id: `yt_${encoded}`
                    };
                });

                sections.push({
                    title: '🎵 AUDIO (MP3)',
                    rows: audioRows.slice(0, 10)
                });
            }

            await sock.sendMessage(chat, {
                text: `📥 *Pilih Format*\n\nKlik tombol di bawah untuk memilih resolusi.`,
                footer: `🎬 ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}`,
                title: '📋 Daftar Format',
                buttonText: '📋 Pilih Format',
                sections: sections,
                contextInfo: {
                    mentionedJid: [sender],
                    isForwarded: true,
                    forwardingScore: 999
                }
            });

            await react('✅');

        } catch (error) {
            console.error('[YT] FATAL ERROR:', error);
            console.error('[YT] Stack:', error.stack);
            await ctx.react('❌');
            return `❌ Terjadi error: ${error.message}`;
        }
    }
};