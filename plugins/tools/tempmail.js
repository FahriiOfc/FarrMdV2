// command/tools/tempmail.js
import { TempMailCreate, TempMailInbox } from '../../scraper/tempmail.js';

export default {
    name: 'tempmail',
    aliases: ['mail'],
    category: 'tools',
    description: 'Buat email sementara',

    async execute(ctx) {
        const { args } = ctx;
        const action = args[0]?.toLowerCase() || 'create';
        await ctx.react('⏳');
        try {
            if (action === 'create') {
                const result = await TempMailCreate();
                if (!result.status) {
                    await ctx.react('❌');
                    return `❌ Gagal buat email: ${result.error}`;
                }
                await ctx.react('✅');
                return (
                    `📧 *Email Sementara*\n\n` +
                    `📩 ${result.email}\n\n` +
                    `💡 Gunakan .tempmail inbox untuk cek pesan`
                );
            }
            if (action === 'inbox') {
                const email = args[1] || '';
                if (!email) {
                    await ctx.react('❌');
                    return '❌ Masukkan email!\n\n📌 Contoh: .tempmail inbox email@domain.com';
                }
                const result = await TempMailInbox(email);
                if (!result.status) {
                    await ctx.react('❌');
                    return `❌ Gagal cek inbox: ${result.error}`;
                }
                await ctx.react('✅');
                if (result.count === 0) {
                    return `📧 *Inbox ${email}*\n\n📭 Tidak ada pesan.`;
                }
                let output = `📧 *Inbox ${email}*\n`;
                output += `📊 ${result.count} pesan\n`;
                output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                const maxMessages = Math.min(result.messages.length, 5);
                for (let i = 0; i < maxMessages; i++) {
                    const msg = result.messages[i];
                    output += `📩 *${msg.subject || 'No subject'}*\n`;
                    output += `   📤 Dari: ${msg.from || 'Unknown'}\n`;
                    output += `   📅 ${new Date(msg.timestamp * 1000).toLocaleString()}\n`;
                    output += `   📝 ${msg.body_preview || msg.body || 'No content'}\n\n`;
                }
                if (result.messages.length > 5) {
                    output += `... dan ${result.messages.length - 5} pesan lainnya.`;
                }
                return output;
            }
            await ctx.react('❌');
            return '❌ Aksi tidak dikenal!\n\n📌 Gunakan: .tempmail create | .tempmail inbox <email>';
        } catch (error) {
            console.error('[TEMPMAIL] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal'}`;
        }
    }
};