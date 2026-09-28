// command/converter/tovideo.js

import media from '../../lib/media.js';

export default {
    name: 'tovideo',
    aliases: ['tovid', 'giftomp4'],
    category: 'converter',
    description: 'Convert sticker to video (animated) or image (static)',

    async execute(ctx) {
        const { sock, chat } = ctx;

        const mediaBuffer = await ctx.getMediaFromMessage?.();

        if (!mediaBuffer) {
            return (
                '❌ Reply ke sticker yang ingin diubah.\n\n' +
                '📌 *Support:*\n' +
                '• Sticker statis → jadi gambar PNG\n' +
                '• Sticker animasi → jadi video MP4 (durasi penuh)'
            );
        }

        await ctx.react('⏳');

        try {
            const result = await media.toVideo(mediaBuffer);

            if (!result || result.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal mengkonversi.';
            }

            // CEK APAKAH INI PNG (STATIC WEBP) ATAU MP4 (ANIMATED)
            const isPng = result.slice(0, 8).toString('hex') === '89504e47';

            if (isPng) {
                await sock.sendMessage(chat, {
                    image: result,
                    caption: '✅ Sticker statis → Gambar'
                });
            } else {
                await sock.sendMessage(chat, {
                    video: result,
                    caption: '✅ Sticker animasi → Video (durasi penuh)'
                });
            }

            await ctx.react('✅');
            return;

        } catch (error) {
            console.error('[TOVIDEO] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengkonversi'}`;
        }
    }
};