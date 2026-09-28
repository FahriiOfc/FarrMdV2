// command/image/removebg.js
import fs from 'fs';
import path from 'path';
import { pixa } from '../../scraper/removebackground.js';

export default {
    name: 'removebg',
    aliases: ['bg'],
    category: 'image',
    description: 'Hapus background dari gambar',

    async execute(ctx) {
        const { sock, chat } = ctx;
        const mediaBuffer = await ctx.getMediaFromMessage?.();
        if (!mediaBuffer) {
            return '❌ Reply ke gambar yang ingin dihapus background-nya!\n\n📌 Contoh: (reply ke gambar) .removebg';
        }
        await ctx.react('⏳');
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `removebg_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, mediaBuffer);
        try {
            const resultBuffer = await pixa(tempPath);
            fs.unlinkSync(tempPath);
            if (!resultBuffer || resultBuffer.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal menghapus background.';
            }
            await sock.sendMessage(chat, {
                image: resultBuffer,
                caption: '✅ *Background Berhasil Dihapus!*'
            });
            await ctx.react('✅');
            return;
        } catch (error) {
            console.error('[REMOVEBG] Error:', error.message);
            try { fs.unlinkSync(tempPath); } catch (e) {}
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal hapus background'}`;
        }
    }
};