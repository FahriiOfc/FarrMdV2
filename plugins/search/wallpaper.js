// command/search/wallpaper.js
import wallpaperScraper from '../../scraper/wallpapersearch.js';

export default {
    name: 'wallpaper',
    aliases: ['wp'],
    category: 'search',
    description: 'Cari wallpaper',

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;
        const query = args.join(' ') || quoted?.text || '';
        if (!query) {
            return '❌ Masukkan kata kunci wallpaper!\n\n📌 Contoh: .wallpaper anime';
        }
        await ctx.react('⏳');
        try {
            const result = await wallpaperScraper(query);
            if (!result.success || result.results.length === 0) {
                await ctx.react('❌');
                return '❌ Tidak ada wallpaper ditemukan.';
            }
            await ctx.react('✅');
            const maxResults = Math.min(result.results.length, 5);
            for (let i = 0; i < maxResults; i++) {
                const item = result.results[i];
                await sock.sendMessage(chat, {
                    image: { url: item.image },
                    caption: `🖼️ *${item.title || 'Wallpaper'}*\n📐 ${item.resolution || ''}`
                });
            }
            return `✅ ${maxResults} wallpaper dikirim!`;
        } catch (error) {
            console.error('[WALLPAPER] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mencari wallpaper'}`;
        }
    }
};