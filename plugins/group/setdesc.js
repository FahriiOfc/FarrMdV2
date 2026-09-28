// command/group/setdesc.js
// Set Group Description

export default {
    name: 'setdesc',
    aliases: ['setdesk'],
    category: 'group',
    description: 'Mengubah deskripsi grup',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, args, quoted } = ctx;

        await ctx.react('⏳');

        // Ambil deskripsi dari argumen atau reply
        let newDesc = args.join(' ') || '';
        
        if (!newDesc && quoted?.text) {
            newDesc = quoted.text;
        }

        if (!newDesc || newDesc.trim() === '') {
            await ctx.react('❌');
            return (
                '❌ Masukkan deskripsi baru!\n\n' +
                '📌 *Contoh:*\n' +
                '.setdesc Deskripsi grup baru\n' +
                '.setdesc (reply ke pesan teks)'
            );
        }

        try {
            await sock.groupUpdateDescription(chat, newDesc);
            await ctx.react('✅');
            return `📝 *Deskripsi Grup Berhasil Diubah!*\n\n${newDesc}`;
        } catch (error) {
            console.error('[SETDESC] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal mengubah deskripsi: ${error.message}`;
        }
    }
};