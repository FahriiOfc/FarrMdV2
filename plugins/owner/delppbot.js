// command/owner/delppbot.js

export default {
    name: 'delppbot',
    aliases: [],
    category: 'owner',
    description: 'Delete bot profile picture',
    ownerOnly: true,

    async execute(ctx) {
        const { sock } = ctx;
        const botJid = sock?.user?.id || '';

        if (!botJid) {
            return '❌ Tidak dapat mengambil ID bot.';
        }

        await ctx.react('⏳');

        try {
            // Use removeProfilePicture from @chaeulso/baileys
            await sock.removeProfilePicture(botJid);
            await ctx.react('✅');
            return '✅ Foto profil bot berhasil dihapus!';
        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal menghapus foto profil bot: ${error.message}`;
        }
    }
};