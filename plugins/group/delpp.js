// command/group/delpp.js

export default {
    name: 'delpp',
    aliases: [],
    category: 'group',
    description: 'Delete group profile picture',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        await ctx.react('⏳');

        try {
            await sock.removeProfilePicture(chat);
            await ctx.react('✅');
            return '✅ Foto profil grup berhasil dihapus!';
        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal menghapus foto profil: ${error.message}`;
        }
    }
};