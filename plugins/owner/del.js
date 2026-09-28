// command/owner/del.js

export default {
    name: 'del',
    aliases: ['d'],
    category: 'owner',
    description: 'Delete a message (reply to target)',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, isGroup, isBotAdmin } = ctx;

        await ctx.react('⏳');

        if (!quoted) {
            await ctx.react('❌');
            return '❌ Reply ke pesan yang ingin dihapus!';
        }

        const quotedKey = quoted.key;

        if (isGroup && !quotedKey.fromMe && !isBotAdmin) {
            await ctx.react('❌');
            return '❌ Bot harus menjadi admin untuk menghapus pesan orang lain.';
        }

        try {
            await sock.sendMessage(chat, { delete: quotedKey });
            await ctx.react('✅');
            return; // Silent success
        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal menghapus pesan: ${error.message}`;
        }
    }
};