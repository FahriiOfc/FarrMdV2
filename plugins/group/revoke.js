// command/group/revoke.js

export default {
    name: 'revoke',
    aliases: [],
    category: 'group',
    description: 'Reset group invite link',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        try {
            await sock.groupRevokeInvite(chat);
            return '♻️ Link grup berhasil direset.';
        } catch (error) {
            return `❌ Gagal mereset link grup: ${error.message}`;
        }
    }
};