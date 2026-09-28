// command/group/pin.js
// Pin a message - Final Fix

import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'pin',
    aliases: [],
    category: 'group',
    description: 'Pin a message (reply to target)',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, quoted, args, sender } = ctx;

        await ctx.react('⏳');

        if (!quoted) {
            await ctx.react('❌');
            return '❌ Reply ke pesan yang ingin dipin!';
        }

        if (!quoted.key || !quoted.key.id) {
            await ctx.react('❌');
            return '❌ Key pesan tidak valid!';
        }

        // ============================================================
        // 1. NORMALISASI KEY - PASTIKAN PARTICIPANT PN BUKAN LID
        // ============================================================

        let participant = quoted.key.participant || quoted.sender || chat;
        
        // Jika participant masih @lid, coba ambil dari quoted.sender atau dari metadata
        if (participant && participant.endsWith('@lid')) {
            console.log('[PIN] Participant is LID:', participant);
            // Coba ambil dari quoted.sender (biasanya sudah PN)
            if (quoted.sender && !quoted.sender.endsWith('@lid')) {
                participant = quoted.sender;
                console.log('[PIN] Using quoted.sender:', participant);
            } else {
                // Coba ambil dari metadata grup
                try {
                    const metadata = await sock.groupMetadata(chat);
                    const found = metadata.participants.find(p => 
                        p.lid === participant || p.id === participant
                    );
                    if (found) {
                        participant = found.id || found.jid || participant;
                        console.log('[PIN] Found in metadata:', participant);
                    }
                } catch (e) {
                    console.log('[PIN] Metadata lookup failed:', e.message);
                }
            }
        }

        // Normalisasi akhir
        participant = normalizeJid(participant);
        const remoteJid = normalizeJid(quoted.key.remoteJid || chat);

        // ============================================================
        // 2. BUILD PIN KEY
        // ============================================================

        const pinKey = {
            remoteJid: remoteJid,
            id: quoted.key.id,
            fromMe: quoted.key.fromMe || false,
            participant: participant
        };

        console.log('[PIN] Final key:', JSON.stringify(pinKey, null, 2));

        // ============================================================
        // 3. PARSE DURASI
        // ============================================================

        let duration = 86400;
        const arg = args[0]?.toLowerCase() || '';

        if (arg === '24h' || arg === '1d') duration = 86400;
        else if (arg === '7d') duration = 604800;
        else if (arg === '30d') duration = 2592000;

        // ============================================================
        // 4. KIRIM PIN
        // ============================================================

        try {
            await sock.sendMessage(chat, {
                pin: {
                    key: pinKey,
                    type: 1,
                    time: duration
                }
            });

            const durationText = arg || '24h';
            await ctx.react('✅');
            
            // Kirim pesan konfirmasi dengan instruksi manual
            return (
                `📌 *Pesan Disematkan!*\n\n` +
                `⏱️ Durasi: ${durationText}\n` +
                `📋 Key ID: ${pinKey.id}\n\n` +
                `💡 Jika pin tidak muncul, coba:\n` +
                `1. Buka grup di WhatsApp\n` +
                `2. Cari pesan dengan icon 📌\n` +
                `3. Atau gunakan .pinnew untuk pin pesan baru`
            );

        } catch (error) {
            console.error('[PIN] Error:', error.message);
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