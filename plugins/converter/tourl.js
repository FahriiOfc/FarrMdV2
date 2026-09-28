// command/tools/tourl.js
// 📤 Upload media ke URL - Native Flow Copy (Link only in buttons)

import axios from 'axios';
import FormData from 'form-data';

// ============================================================
// UPLOADER FUNCTIONS
// ============================================================

const uploaders = [
    async (buffer, filename) => {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename });
        const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (typeof data === 'string' && data.startsWith('http')) {
            return { host: 'Catbox', url: data.trim(), expires: 'Permanen' };
        }
        throw new Error('Catbox gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('time', '72h');
        form.append('fileToUpload', buffer, { filename });
        const { data } = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (typeof data === 'string' && data.startsWith('http')) {
            return { host: 'Litterbox', url: data.trim(), expires: '72 jam' };
        }
        throw new Error('Litterbox gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('file', buffer, { filename });
        const { data } = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (data?.data?.url) {
            return {
                host: 'Tmpfiles',
                url: data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/'),
                expires: '1 jam'
            };
        }
        throw new Error('Tmpfiles gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('files[]', buffer, { filename });
        const { data } = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (data?.success && data?.files?.[0]?.url) {
            return { host: 'Uguu', url: data.files[0].url, expires: '48 jam' };
        }
        throw new Error('Uguu gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('file', buffer, { filename });
        const { data } = await axios.post('https://0x0.st', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (typeof data === 'string' && data.startsWith('http')) {
            return { host: '0x0.st', url: data.trim(), expires: 'Permanen' };
        }
        throw new Error('0x0.st gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('file', buffer, { filename });
        const { data } = await axios.post('https://qu.ax/upload.php', form, {
            headers: form.getHeaders(),
            timeout: 60000
        });
        if (data?.success && data?.files?.[0]?.url) {
            return { host: 'Qu.ax', url: data.files[0].url, expires: 'Permanen' };
        }
        throw new Error('Qu.ax gagal');
    },
    async (buffer, filename) => {
        const form = new FormData();
        form.append('files[]', buffer, { filename });
        const { data } = await axios.post('https://pone.rs/upload.php', form, {
            headers: {
                ...form.getHeaders(),
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 60000
        });
        if (data?.success && data?.files?.[0]?.url) {
            return {
                host: 'Pone',
                url: data.files[0].url.replaceAll('\\/', '/'),
                expires: 'Permanen'
            };
        }
        throw new Error('Pone gagal');
    }
];

// ============================================================
// EXTENSION MAP
// ============================================================

const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/3gpp': '3gp',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/opus': 'opus',
    'application/pdf': 'pdf',
    'text/plain': 'txt'
};

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'tourl',
    aliases: ['upload', 'host'],
    category: 'tools',
    description: '📤 Upload media ke URL (Native Flow Copy)',

    async execute(ctx) {
        const { sock, chat, sender, pushName, message, quoted, react, reply } = ctx;
        await react('⏳');

        const botName = 'FarrMdV1';
        const userName = pushName || sender.split('@')[0] || 'User';

        // ============================================================
        // AMBIL MEDIA
        // ============================================================

        let mediaBuffer = null;
        let mimeType = '';

        if (quoted) {
            try {
                const media = await ctx.getMediaFromMessage?.();
                if (media && media.length > 0) {
                    mediaBuffer = media;
                    const quotedMsg = quoted.message || {};
                    for (const key of ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']) {
                        if (quotedMsg[key]) {
                            mimeType = quotedMsg[key].mimetype || '';
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log('[TOURL] Quoted media error:', e.message);
            }
        }

        if (!mediaBuffer) {
            try {
                const media = await ctx.getMediaFromMessage?.();
                if (media && media.length > 0) {
                    mediaBuffer = media;
                    const msg = message.message || {};
                    for (const key of ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']) {
                        if (msg[key]) {
                            mimeType = msg[key].mimetype || '';
                            break;
                        }
                    }
                }
            } catch (e) {
                console.log('[TOURL] Message media error:', e.message);
            }
        }

        if (!mediaBuffer || mediaBuffer.length === 0) {
            await react('❌');
            return (
                `📤 *Upload to URL*\n\n` +
                `❌ Kirim atau reply media dengan caption:\n` +
                `.tourl\n\n` +
                `📌 *Support:* Gambar, Video, Audio, Sticker, Dokumen\n` +
                `📌 *Hosting:* Catbox, Litterbox, Tmpfiles, Uguu, 0x0.st, Qu.ax, Pone`
            );
        }

        // ============================================================
        // DAPATKAN EXTENSION
        // ============================================================

        const cleanMime = mimeType.split(';')[0] || 'application/octet-stream';
        const ext = extMap[cleanMime] || 'bin';
        const filename = `file.${ext}`;
        const sizeKB = (mediaBuffer.length / 1024).toFixed(1);

        // ============================================================
        // UPLOAD KE SEMUA HOSTING
        // ============================================================

        const results = [];
        let failedCount = 0;

        for (const uploader of uploaders) {
            try {
                const result = await uploader(mediaBuffer, filename);
                results.push(result);
                console.log(`[TOURL] ✅ ${result.host}: ${result.url}`);
            } catch (error) {
                failedCount++;
                console.log(`[TOURL] ❌ Upload failed: ${error.message}`);
            }
        }

        if (results.length === 0) {
            await react('❌');
            return `🛑 Semua server hosting gagal mengunggah media!`;
        }

        // ============================================================
        // FAKE QUOTED HEADER
        // ============================================================

        const fakeQuotedMessage = {
            conversation:
                `📤 *UPLOAD TO URL*\n` +
                `${botName} Hosting Service`
        };

        const fakeStanzaId = `tourl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        // ============================================================
        // BUILD CAPTION (TANPA LINK)
        // ============================================================

        let caption = `╭───『 *UPLOAD SUCCESS* 』\n`;
        caption += `┆ 📊 *Size :* ${sizeKB} KB\n`;
        caption += `┆ 📋 Silahkan pilih dan salin link yang anda inginkan\n`;
        caption += `╰────────  ✦\n\n`;

        // Tampilkan daftar hosting + expired (tanpa link)
        results.forEach(r => {
            caption += `☁️ *${r.host}*\n`;
            caption += `⏳ *Expired :* ${r.expires}\n\n`;
        });

        if (failedCount > 0) {
            caption += `⚠️ Gagal di ${failedCount} server hosting.\n\n`;
        }

        caption += `👤 *@${userName}* · 🛡️ ${botName}`;

        // ============================================================
        // NATIVE FLOW BUTTONS (Copy Link per Hosting)
        // ============================================================

        const nativeFlow = results.map(r => ({
            text: `📋 ${r.host}`,
            copy: r.url,
            icon: 'copy'
        }));

        // ============================================================
        // KIRIM DENGAN NATIVE FLOW + FAKE QUOTED
        // ============================================================

        try {
            await sock.sendMessage(chat, {
                text: caption,
                contextInfo: {
                    quotedMessage: fakeQuotedMessage,
                    stanzaId: fakeStanzaId,
                    participant: sock.user.id,
                    remoteJid: chat,
                    isForwarded: true,
                    forwardingScore: 999,
                    mentionedJid: [sender]
                },
                optionText: '📋 Pilih Link',
                nativeFlow: nativeFlow,
                footer: `📤 ${botName} • ${new Date().toLocaleTimeString('id-ID')}`
            });

            await react('✅');

        } catch (error) {
            console.error('[TOURL] Native Flow error:', error.message);
            await react('❌');

            // Fallback: kirim text biasa dengan link
            let fallbackText = caption + '\n\n📌 Link:\n';
            results.forEach(r => {
                fallbackText += `\n${r.host}: ${r.url}`;
            });

            await reply(fallbackText);
        }
    }
};