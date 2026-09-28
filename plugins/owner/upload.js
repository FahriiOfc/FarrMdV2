// command/owner/upload.js
// 📤 Upload file ke VPS via WhatsApp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = '/root/uploads';

export default {
    name: 'upload',
    aliases: ['up'],
    category: 'owner',
    description: '📤 Upload file ke VPS (reply ke file)',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, react, reply, args, message } = ctx;

        // ============================================================
        // CEK FILE
        // ============================================================

        const mediaMsg = quoted?.message?.documentMessage ||
                         quoted?.message?.imageMessage ||
                         quoted?.message?.videoMessage ||
                         quoted?.message?.audioMessage ||
                         message?.message?.documentMessage ||
                         message?.message?.imageMessage ||
                         message?.message?.videoMessage;

        if (!mediaMsg) {
            await react('❌');
            return (
                '📤 *Upload File*\n\n' +
                '❌ Reply ke pesan yang berisi file!\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '1. Kirim file ke bot (document/image/video/audio)\n' +
                '2. Reply pesan tersebut dengan `.upload`\n\n' +
                '📌 *Contoh:*\n' +
                '.upload project.zip'
            );
        }

        await react('⏳');

        try {
            // ============================================================
            // TENTUKAN NAMA FILE
            // ============================================================

            let fileName = args?.join(' ') || mediaMsg.fileName || 'file.bin';
            const cleanName = path.basename(fileName);
            const fullPath = path.join(UPLOAD_DIR, cleanName);

            // Pastikan folder uploads ada
            if (!fs.existsSync(UPLOAD_DIR)) {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            }

            // ============================================================
            // DOWNLOAD MEDIA (METHOD 1: downloadMediaMessage)
            // ============================================================

            let buffer = null;

            try {
                // Coba method 1: dari ctx (jika ada)
                if (ctx.downloadMediaMessage) {
                    buffer = await ctx.downloadMediaMessage({
                        key: quoted?.key || message.key,
                        message: quoted?.message || message.message
                    });
                }
            } catch (e) {
                console.log('[UPLOAD] Method 1 failed:', e.message);
            }

            // Method 2: dari sock (jika ada)
            if (!buffer && sock.downloadMediaMessage) {
                try {
                    buffer = await sock.downloadMediaMessage({
                        key: quoted?.key || message.key,
                        message: quoted?.message || message.message
                    });
                } catch (e) {
                    console.log('[UPLOAD] Method 2 failed:', e.message);
                }
            }

            // Method 3: dari global (jika ada)
            if (!buffer && global.downloadMediaMessage) {
                try {
                    buffer = await global.downloadMediaMessage({
                        key: quoted?.key || message.key,
                        message: quoted?.message || message.message
                    });
                } catch (e) {
                    console.log('[UPLOAD] Method 3 failed:', e.message);
                }
            }

            // Method 4: Manual download via axios
            if (!buffer) {
                try {
                    const axios = (await import('axios')).default;
                    // Coba download dari URL jika ada
                    const mediaUrl = mediaMsg.url || mediaMsg.directPath;
                    if (mediaUrl) {
                        const response = await axios.get(mediaUrl, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        buffer = Buffer.from(response.data);
                    }
                } catch (e) {
                    console.log('[UPLOAD] Method 4 failed:', e.message);
                }
            }

            // Method 5: Stream download (Baileys v7+)
            if (!buffer && sock.downloadContentFromMessage) {
                try {
                    const stream = await sock.downloadContentFromMessage(
                        mediaMsg,
                        Object.keys(mediaMsg)[0] || 'document'
                    );
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    buffer = Buffer.concat(chunks);
                } catch (e) {
                    console.log('[UPLOAD] Method 5 failed:', e.message);
                }
            }

            if (!buffer) {
                await react('❌');
                return '❌ Gagal download file. Coba kirim ulang file.';
            }

            // ============================================================
            // SIMPAN FILE
            // ============================================================

            fs.writeFileSync(fullPath, buffer);
            const fileSize = (buffer.length / 1024).toFixed(2);

            // ============================================================
            // JIKA ZIP, EKSTRAK OTOMATIS
            // ============================================================

            let extraInfo = '';
            const isZip = cleanName.endsWith('.zip') || 
                          cleanName.endsWith('.ZIP') ||
                          buffer.slice(0, 4).toString('hex') === '504b0304';

            if (isZip) {
                try {
                    const extractDir = fullPath.replace(/\.zip$/i, '');
                    await execAsync(`mkdir -p ${extractDir} && unzip -o ${fullPath} -d ${extractDir} 2>/dev/null || true`);
                    extraInfo = `\n📂 Ekstrak ke: ${extractDir}`;
                } catch (e) {
                    extraInfo = `\n⚠️ Gagal extract ZIP: ${e.message}`;
                }
            }

            // ============================================================
            // RESPONSE
            // ============================================================

            await react('✅');
            return (
                `✅ *Upload Berhasil!*\n\n` +
                `📁 Nama: ${cleanName}\n` +
                `📁 Path: ${fullPath}\n` +
                `📦 Size: ${fileSize} KB\n` +
                `📂 Folder: ${UPLOAD_DIR}\n` +
                `${extraInfo}\n\n` +
                `📌 *Akses file:*\n` +
                `cat ${fullPath}\n` +
                `nano ${fullPath}\n` +
                `rm ${fullPath}`
            );

        } catch (error) {
            console.error('[UPLOAD] Error:', error);
            await react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};