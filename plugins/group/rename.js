// command/group/rename.js
// Rename Group

export default {
    name: 'rename',
    aliases: ['grupname', 'changename'],
    category: 'group',
    description: 'Mengubah nama grup',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;

        await ctx.react('⏳');

        // Ambil nama baru dari argumen atau reply
        let newName = args.join(' ') || '';
        
        if (!newName && quoted?.text) {
            newName = quoted.text;
        }

        if (!newName || newName.trim() === '') {
            await ctx.react('❌');
            return (
                '❌ Masukkan nama grup baru!\n\n' +
                '📌 *Contoh:*\n' +
                '.rename Nama Grup Baru\n' +
                '.rename (reply ke pesan teks)'
            );
        }

        try {
            await sock.groupUpdateSubject(chat, newName);
            await ctx.react('✅');
            return `✏️ *Nama Grup Berhasil Diubah!*\n\n📛 ${newName}`;
        } catch (error) {
            console.error('[RENAME] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal mengubah nama grup: ${error.message}`;
        }
    }
};