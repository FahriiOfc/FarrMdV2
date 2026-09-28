// command/image/upscale.js
import fs from 'fs';
import path from 'path';
import upscaler from '../../scraper/upscaler.js';

export default {
    name: 'upscale',
    aliases: ['hd'],
    category: 'image',
    description: 'Upscale gambar ke HD',

    async execute(ctx) {
        const { sock, chat } = ctx;
        const mediaBuffer = await ctx.getMediaFromMessage?.();
        if (!mediaBuffer) {
            return '❌ Reply ke gambar yang ingin di-upscale!\n\n📌 Contoh: (reply ke gambar) .upscale';
        }
        await ctx.react('⏳');
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `upscale_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, mediaBuffer);
        try {
            const result = await upscaler(tempPath);
            try { fs.unlinkSync(tempPath); } catch (e) {}
            if (!result?.output) {
                await ctx.react('❌');
                return '❌ Gagal upscale gambar.';
            }
            await sock.sendMessage(chat, {
                image: { url: result.output },
                caption: '✅ *Upscale Berhasil!*\n📷 Gambar telah ditingkatkan kualitasnya.'
            });
            await ctx.react('✅');
            return;
        } catch (error) {
            console.error('[UPSCALE] Error:', error.message);
            try { fs.unlinkSync(tempPath); } catch (e) {}
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal upscale gambar'}`;
        }
    }
};