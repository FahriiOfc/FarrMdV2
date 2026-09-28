// command/converter/tovn.js

import media from '../../lib/media.js';

export default {
    name: 'tovn',
    aliases: [],
    category: 'converter',
    description: 'Convert audio to voice note',

    async execute(ctx) {
        const { sock, chat } = ctx;

        const mediaBuffer = await ctx.getMediaFromMessage?.();

        if (!mediaBuffer) {
            return '❌ Reply ke audio yang ingin diubah menjadi voice note.';
        }

        await ctx.react('⏳');

        try {
            const vnBuffer = await media.toVoiceNote(mediaBuffer);
            
            if (!vnBuffer || vnBuffer.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal mengubah audio ke voice note.';
            }

            await sock.sendMessage(chat, {
                audio: vnBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
            await ctx.react('✅');
            return;
        } catch (error) {
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengubah ke voice note'}`;
        }
    }
};