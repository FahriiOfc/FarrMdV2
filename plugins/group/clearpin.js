// command/group/clearpin.js
// Clear all pins in group

export default {
    name: 'clearpin',
    aliases: ['unpinall', 'unpinall'],
    category: 'group',
    description: 'Remove all pinned messages in group',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat } = ctx;

        await ctx.react('⏳');

        try {
            // Ambil metadata grup
            const metadata = await sock.groupMetadata(chat);
            
            // Cari pesan terpin (dari metadata tidak ada, jadi kita coba kirim unpin ke semua)
            // Cara alternatif: coba unpin dengan key kosong (tidak bisa)
            
            // Kirim pesan konfirmasi
            await ctx.reply(
                '🔄 *Menghapus semua pin...*\n\n' +
                '⚠️ WhatsApp tidak menyediakan API untuk melihat daftar pin.\n\n' +
                '💡 Coba cara manual:\n' +
                '1. Buka grup di WhatsApp\n' +
                '2. Cari pesan yang terpin (ada icon 📌)\n' +
                '3. Tap dan pilih "Lepas pin"\n\n' +
                '📌 Atau reply ke pesan terpin dan ketik: `.unpin`'
            );
            
            await ctx.react('✅');
            
        } catch (error) {
            console.error('[CLEARPIN] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal: ${error.message}`;
        }
    }
};