// command/group/setpp.js

export default {
    name: 'setpp',
    aliases: [],
    category: 'group',
    description: 'Set group profile picture',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        const mediaBuffer = await ctx.getMediaFromMessage?.();

        if (!mediaBuffer) {
            return (
                '❌ Kirim gambar atau reply ke gambar yang ingin dijadikan foto profil grup.\n\n' +
                'Contoh:\n' +
                '.setpp (reply ke gambar)\n' +
                '.setpp (kirim gambar dengan caption .setpp)'
            );
        }

        await ctx.react('⏳');

        try {
            await sock.updateProfilePicture(chat, mediaBuffer);
            await ctx.react('✅');
            return '✅ Foto profil grup berhasil diperbarui!';
        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal mengubah foto profil: ${error.message}`;
        }
    }
};