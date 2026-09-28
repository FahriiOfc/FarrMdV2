// command/tools/mconvert.js
import { mconverter } from '../../scraper/mconverter.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'mconvert',
    aliases: ['convert'],
    category: 'tools',
    description: 'Konversi berbagai format file',

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;
        const targetFormat = args[0] || '';
        if (!targetFormat) {
            return (
                '❌ Masukkan format target!\n\n' +
                '📌 *Format support:* mp4, mp3, webp, gif, pdf, docx, xlsx, png, jpg, webm, wav, flac, dll\n\n' +
                '📌 *Contoh:* .mconvert mp4 (reply ke file)'
            );
        }
        const mediaBuffer = await ctx.getMediaFromMessage?.();
        if (!mediaBuffer) {
            return '❌ Reply ke file yang ingin dikonversi!';
        }
        await ctx.react('⏳');
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const inputPath = path.join(tempDir, `convert_${Date.now()}.tmp`);
        fs.writeFileSync(inputPath, mediaBuffer);
        try {
            const result = await mconverter.convert(inputPath, targetFormat);
            try { fs.unlinkSync(inputPath); } catch (e) {}
            if (result?.error) {
                await ctx.react('❌');
                return `❌ Gagal konversi: ${result.error}`;
            }
            if (result?.url) {
                const response = await fetch(result.url);
                const buffer = await response.arrayBuffer();
                await sock.sendMessage(chat, {
                    document: Buffer.from(buffer),
                    fileName: `converted.${targetFormat}`,
                    mimetype: `application/${targetFormat}`
                });
                await ctx.react('✅');
                return '✅ Konversi berhasil!';
            }
            await ctx.react('❌');
            return '❌ Gagal konversi.';
        } catch (error) {
            console.error('[MCONVERT] Error:', error.message);
            try { fs.unlinkSync(inputPath); } catch (e) {}
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal konversi'}`;
        }
    }
};