// command/group/resetname.js
// Reset Group Name to Default

export default {
    name: 'resetname',
    aliases: ['resetnama', 'defaultname'],
    category: 'group',
    description: 'Reset nama grup ke default (nama awal)',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, metadata } = ctx;

        await ctx.react('⏳');

        try {
            // Ambil nama default dari metadata (nama saat grup dibuat)
            // WhatsApp tidak menyimpan nama default, jadi kita pakai nama saat ini
            // dan reset ke format "Group X" atau berdasarkan ID
            
            const currentName = metadata?.subject || 'Grup';
            
            // Coba ambil nama dari history atau buat default
            // Karena WhatsApp tidak punya "nama default", kita reset ke "Group [ID pendek]"
            const shortId = chat.split('@')[0].slice(-6);
            const defaultName = `Group ${shortId}`;

            await sock.groupUpdateSubject(chat, defaultName);
            await ctx.react('✅');
            return `🔄 *Nama Grup Direset!*\n\n📛 ${defaultName}`;
        } catch (error) {
            console.error('[RESETNAME] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal reset nama grup: ${error.message}`;
        }
    }
};