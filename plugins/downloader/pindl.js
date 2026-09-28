// command/downloader/pindl.js
import scrapePinterest from '../../scraper/pindl.js';

export default {
    name: 'pindl',
    aliases: ['pin'],
    category: 'downloader',
    description: 'Download Pinterest',

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;
        let url = args[0] || quoted?.text || '';
        const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch) url = urlMatch[0];
        if (!url || !url.includes('pinterest.com') && !url.includes('pin.it')) {
            return '❌ Masukkan URL Pinterest!\n\n📌 Contoh: .pindl https://id.pinterest.com/pin/xxx';
        }
        await ctx.react('⏳');
        try {
            const result = await scrapePinterest(url);
            if (!result?.media || result.media.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal mengunduh. Coba URL lain.';
            }
            await ctx.react('✅');
            const media = result.media[0];
            if (media.type === 'video') {
                await sock.sendMessage(chat, {
                    video: { url: media.url },
                    caption: `📌 ${result.title || 'Pinterest'}`
                });
            } else {
                await sock.sendMessage(chat, {
                    image: { url: media.url },
                    caption: `📌 ${result.title || 'Pinterest'}`
                });
            }
            return '✅ Selesai!';
        } catch (error) {
            console.error('[PINDL] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengunduh'}`;
        }
    }
};