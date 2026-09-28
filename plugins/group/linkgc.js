// command/group/linkgc.js

export default {
    name: 'linkgc',
    aliases: ['gclink'],
    category: 'group',
    description: 'Get group invite link',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        try {
            const code = await sock.groupInviteCode(chat);
            return `🔗 *Link Grup*\n\nhttps://chat.whatsapp.com/${code}`;
        } catch (error) {
            return `❌ Gagal mengambil link grup: ${error.message}`;
        }
    }
};