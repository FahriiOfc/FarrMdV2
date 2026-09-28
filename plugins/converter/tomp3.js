// command/converter/tomp3.js

import media from '../../lib/media.js';

export default {
    name: 'tomp3',
    aliases: [],
    category: 'converter',
    description: 'Convert video to MP3 audio',

    async execute(ctx) {
        const { sock, chat } = ctx;

        const mediaBuffer = await ctx.getMediaFromMessage?.();

        if (!mediaBuffer) {
            return '❌ Reply ke video yang ingin diubah menjadi MP3.';
        }

        await ctx.react('⏳');

        try {
            const audioBuffer = await media.toMP3(mediaBuffer);
            
            if (!audioBuffer || audioBuffer.length === 0) {
                await ctx.react('❌');
                return '❌ Gagal mengubah video ke MP3.';
            }

            await sock.sendMessage(chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'audio.mp3'
            });
            await ctx.react('✅');
            return;
        } catch (error) {
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengubah ke MP3'}`;
        }
    }
};