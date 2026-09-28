// command/owner/pinlist.js
// Lihat daftar pesan yang dipin (owner only)

export default {
    name: 'pinlist',
    aliases: ['listpin'],
    category: 'owner',
    description: 'Lihat daftar pesan yang dipin di grup (owner only)',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, isGroup, args } = ctx;

        await ctx.react('⏳');

        if (!isGroup) {
            await ctx.react('❌');
            return '❌ Command ini hanya untuk grup.';
        }

        // Ambil target grup (default: grup saat ini)
        let targetGroup = chat;
        if (args[0] && args[0].endsWith('@g.us')) {
            targetGroup = args[0];
        }

        try {
            // Ambil metadata grup
            const metadata = await sock.groupMetadata(targetGroup);
            
            // Catatan: Baileys tidak menyediakan API langsung untuk daftar pesan terpin
            // Ini hanya menampilkan info grup
            const info = 
                `📌 *Info Grup*\n\n` +
                `📁 Nama: ${metadata.subject}\n` +
                `👥 Member: ${metadata.participants?.length || 0}\n` +
                `📅 Dibuat: ${new Date(metadata.creation * 1000).toLocaleDateString()}\n\n` +
                `💡 Untuk pin/unpin, gunakan:\n` +
                `.pin (reply ke pesan)\n` +
                `.unpin (reply ke pesan terpin)`;

            await ctx.react('✅');
            return info;

        } catch (error) {
            console.error('[PINLIST] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal mengambil info grup: ${error.message}`;
        }
    }
};