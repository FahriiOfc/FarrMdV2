// command/owner/setppbot.js

export default {
    name: 'setppbot',
    aliases: [],
    category: 'owner',
    description: 'Set bot profile picture',
    ownerOnly: true,

    async execute(ctx) {
        const { sock } = ctx;
        const botJid = sock?.user?.id || '';

        if (!botJid) {
            return '❌ Tidak dapat mengambil ID bot.';
        }

        const mediaBuffer = await ctx.getMediaFromMessage?.();

        if (!mediaBuffer) {
            return (
                '❌ Kirim gambar atau reply ke gambar untuk dijadikan foto profil bot.\n\n' +
                'Contoh:\n' +
                '.setppbot (reply ke gambar)\n' +
                '.setppbot (kirim gambar dengan caption .setppbot)'
            );
        }

        await ctx.react('⏳');

        try {
            await sock.updateProfilePicture(botJid, mediaBuffer);
            await ctx.react('✅');
            return '✅ Foto profil bot berhasil diperbarui!';
        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal mengubah foto profil bot: ${error.message}`;
        }
    }
};