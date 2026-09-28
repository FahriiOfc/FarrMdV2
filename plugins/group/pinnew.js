// command/group/pinnew.js
// Kirim pesan baru lalu langsung di-pin

import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'pinnew',
    aliases: ['pinmsg'],
    category: 'group',
    description: 'Kirim pesan baru dan langsung pin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, args } = ctx;

        await ctx.react('⏳');

        // ============================================================
        // 1. PARSE INPUT
        // ============================================================

        let duration = 86400;
        let cleanText = args.join(' ') || '📌 *Pesan Disematkan*';
        let durationText = '24h';

        // Cek apakah argumen pertama adalah durasi
        const firstArg = args[0]?.toLowerCase() || '';
        if (firstArg === '24h' || firstArg === '1d') {
            duration = 86400;
            durationText = '24h';
            cleanText = args.slice(1).join(' ') || '📌 *Pesan Disematkan*';
        } else if (firstArg === '7d') {
            duration = 604800;
            durationText = '7d';
            cleanText = args.slice(1).join(' ') || '📌 *Pesan Disematkan*';
        } else if (firstArg === '30d') {
            duration = 2592000;
            durationText = '30d';
            cleanText = args.slice(1).join(' ') || '📌 *Pesan Disematkan*';
        }

        if (!cleanText || cleanText.trim().length === 0) {
            await ctx.react('❌');
            return '❌ Masukkan teks pesan yang ingin dipin!\n\n📌 Contoh:\n.pinnew Halo ini pesan pin\n.pinnew 7d Halo ini pesan pin 7 hari';
        }

        // ============================================================
        // 2. KIRIM PESAN
        // ============================================================

        try {
            const sentMsg = await sock.sendMessage(chat, {
                text: cleanText
            });

            console.log('[PINNEW] Sent:', JSON.stringify(sentMsg.key, null, 2));

            // ============================================================
            // 3. PIN PESAN
            // ============================================================

            const pinKey = {
                remoteJid: normalizeJid(sentMsg.key.remoteJid),
                id: sentMsg.key.id,
                fromMe: true,
                participant: normalizeJid(sentMsg.key.participant || chat)
            };

            await sock.sendMessage(chat, {
                pin: {
                    key: pinKey,
                    type: 1,
                    time: duration
                }
            });

            await ctx.react('✅');
            
            return (
                `📌 *Pesan Disematkan!*\n\n` +
                `📝 ${cleanText}\n` +
                `⏱️ Durasi: ${durationText}\n\n` +
                `💡 Pesan baru telah dikirim dan dipin.\n` +
                `🔍 Cari pesan dengan icon 📌 di grup.`
            );

        } catch (error) {
            console.error('[PINNEW] Error:', error.message);
            await ctx.react('❌');
            
            let errorMsg = '❌ Gagal menyematkan pesan.\n\n';
            if (error.message?.includes('not-authorized')) {
                errorMsg += '⚠️ Bot harus menjadi admin grup.';
            } else {
                errorMsg += `Error: ${error.message}`;
            }
            return errorMsg;
        }
    }
};