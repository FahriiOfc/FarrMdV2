// command/group/deldesc.js
// Delete Group Description

export default {
    name: 'deldesc',
    aliases: ['deldesk'],
    category: 'group',
    description: 'Menghapus deskripsi grup',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        await ctx.react('⏳');

        try {
            // Hapus deskripsi dengan mengirim string kosong
            await sock.groupUpdateDescription(chat, '');
            await ctx.react('✅');
            return '🗑️ *Deskripsi Grup Berhasil Dihapus!*';
        } catch (error) {
            console.error('[DELDESC] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal menghapus deskripsi: ${error.message}`;
        }
    }
};