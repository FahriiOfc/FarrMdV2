// command/downloader/terabox.js
// 📦 Terabox Downloader

import { TeraBoxDL } from '../../scraper/terabox.js';
import config from '../../config.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../../temp');

function ensureTempDir() {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default {
    name: 'terabox',
    aliases: ['tb', 'teraboxdl', 'tbdl'],
    category: 'downloader',
    description: '📦 Download video dari Terabox',

    async execute(ctx) {
        const { sock, chat, args, reply, react, sender } = ctx;

        // ============================================================
        // CEK URL
        // ============================================================

        let url = args.join(' ').trim();

        if (!url) {
            // Cek apakah ada link di quoted message
            if (ctx.quoted?.text) {
                const quotedText = ctx.quoted.text;
                const urlMatch = quotedText.match(/(https?:\/\/[^\s]+)/i);
                if (urlMatch) {
                    url = urlMatch[0];
                }
            }
        }

        if (!url) {
            await react('❌');
            return (
                '📦 *Terabox Downloader*\n\n' +
                '❌ Masukkan link Terabox!\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '.terabox <link>\n' +
                '.tb <link>\n\n' +
                '📌 *Atau reply ke pesan yang berisi link*\n' +
                'Reply pesan dengan `.terabox`'
            );
        }

        // Validasi URL Terabox
        if (!url.includes('terabox') && !url.includes('103.214.120.204')) {
            await react('❌');
            return '❌ URL tidak valid! Masukkan link Terabox yang benar.';
        }

        await react('⏳');
        await reply(`📦 *Terabox Downloader*\n\n⏳ Sedang memproses link...\n🔗 ${url}`);

        try {
            // ============================================================
            // SCRAPE TERABOX
            // ============================================================

            const result = await TeraBoxDL(url);

            if (!result.status) {
                await react('❌');
                return `❌ Gagal mengambil data: ${result.error || 'Unknown error'}`;
            }

            const { file_name, download_url, thumbnail, file_size, duration, extension } = result;

            // ============================================================
            // TAMPILKAN INFO
            // ============================================================

            const infoText = 
                `📦 *Terabox Downloader*\n\n` +
                `📌 *Nama:* ${file_name || 'Tidak diketahui'}\n` +
                `📏 *Ukuran:* ${formatFileSize(file_size)}\n` +
                `⏱️ *Durasi:* ${formatDuration(duration)}\n` +
                `📁 *Format:* ${extension || 'Unknown'}\n\n` +
                `⏳ Mengunduh video...` +
                `\n\n⚠️ *File besar mungkin memakan waktu*`;

            await reply(infoText);

            // ============================================================
            // DOWNLOAD FILE
            // ============================================================

            ensureTempDir();
            const timestamp = Date.now();
            const tempFile = path.join(TEMP_DIR, `terabox_${timestamp}.${extension || 'mp4'}`);

            console.log(`[TERABOX] Downloading: ${download_url}`);

            const response = await axios({
                method: 'GET',
                url: download_url,
                responseType: 'stream',
                timeout: 600000, // 10 menit
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.terabox.com/'
                }
            });

            const writer = fs.createWriteStream(tempFile);
            let downloadedBytes = 0;
            const totalBytes = parseInt(response.headers['content-length']) || 0;

            response.data.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (totalBytes > 0) {
                    const percent = ((downloadedBytes / totalBytes) * 100).toFixed(0);
                    if (downloadedBytes % (1024 * 1024) < 65536) { // Log setiap ~1MB
                        console.log(`[TERABOX] Download: ${percent}% (${formatFileSize(downloadedBytes)})`);
                    }
                }
            });

            await new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
                response.data.on('error', reject);
            });

            const fileSizeOnDisk = fs.statSync(tempFile).size;

            if (fileSizeOnDisk < 1024) {
                fs.unlinkSync(tempFile);
                throw new Error('File terlalu kecil, mungkin error download');
            }

            console.log(`[TERABOX] Download complete: ${formatFileSize(fileSizeOnDisk)}`);

            // ============================================================
            // KIRIM FILE
            // ============================================================

            const caption = 
                `📦 *Terabox Downloader*\n\n` +
                `📌 *Nama:* ${file_name || 'Video'}\n` +
                `📏 *Ukuran:* ${formatFileSize(fileSizeOnDisk)}\n` +
                `⏱️ *Durasi:* ${formatDuration(duration)}\n\n` +
                `✅ *Download berhasil!*`;

            // Kirim video
            await sock.sendMessage(chat, {
                video: fs.readFileSync(tempFile),
                caption: caption,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: [sender]
                }
            });

            // ============================================================
            // CLEANUP
            // ============================================================

            try {
                fs.unlinkSync(tempFile);
                console.log('[TERABOX] Temp file deleted');
            } catch (e) {}

            await react('✅');

        } catch (error) {
            console.error('[TERABOX] Error:', error.message);
            await react('❌');
            return `❌ Gagal mendownload: ${error.message}`;
        }
    }
};