// command/downloader/tiktok.js

import downloader from '../../lib/downloader.js';

export default {
    name: 'tiktok',
    aliases: ['tt'],
    category: 'downloader',
    description: 'Download TikTok video (no watermark)',

    async execute(ctx) {
        const { sock, chat } = ctx;
        let url = ctx.text || ctx.args.join(' ') || '';

        if (!url && ctx.quoted?.text) {
            url = ctx.quoted.text;
        }

        if (url) {
            const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
            if (urlMatch) {
                url = urlMatch[0];
            }
        }

        if (!url) {
            return (
                '❌ Masukkan URL!\n\n' +
                '📥 *Cara penggunaan:*\n' +
                '`.tiktok <url>` atau `.tt <url>`\n\n' +
                'Contoh:\n' +
                '`.tt https://vt.tiktok.com/xxx`'
            );
        }

        await ctx.react('⏳');

        try {
            const result = await downloader.tiktok(url);
            
            if (!result) {
                await ctx.react('❌');
                return '❌ Gagal mengunduh. Coba URL lain.';
            }

            await sock.sendMessage(chat, {
                video: { url: result.video },
                caption: `🎵 ${result.caption || 'TikTok'}`
            });

            await ctx.react('✅');
            return;
        } catch (error) {
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengunduh'}`;
        }
    }
};