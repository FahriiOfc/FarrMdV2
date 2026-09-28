// command/downloader/twitterdl.js
import x2twitterDl from '../../scraper/twitter.js';

export default {
    name: 'twitterdl',
    aliases: ['xdl', 'twdl'],
    category: 'downloader',
    description: 'Download Twitter/X',

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;
        let url = args[0] || quoted?.text || '';
        const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch) url = urlMatch[0];
        if (!url || !url.includes('twitter.com') && !url.includes('x.com')) {
            return '❌ Masukkan URL Twitter/X!\n\n📌 Contoh: .twitterdl https://twitter.com/user/status/xxx';
        }
        await ctx.react('⏳');
        try {
            const result = await x2twitterDl(url);
            if (result?.error || !result?.videos || result.videos.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal mengunduh. Coba URL lain.';
            }
            await ctx.react('✅');
            const videos = result.videos;
            const hdVideo = videos.find(v => v.resolution?.includes('720')) || videos[0];
            await sock.sendMessage(chat, {
                video: { url: hdVideo.url },
                caption: '🐦 Twitter/X'
            });
            return '✅ Selesai!';
        } catch (error) {
            console.error('[TWITTERDL] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengunduh'}`;
        }
    }
};