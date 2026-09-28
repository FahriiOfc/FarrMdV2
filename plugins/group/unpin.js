// command/group/unpin.js
// Unpin a message - Final Fix

import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'unpin',
    aliases: [],
    category: 'group',
    description: 'Unpin a message (reply to target)',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { sock, chat, quoted } = ctx;

        await ctx.react('⏳');

        if (!quoted) {
            await ctx.react('❌');
            return '❌ Reply ke pesan yang ingin dilepas pinnya!';
        }

        if (!quoted.key || !quoted.key.id) {
            await ctx.react('❌');
            return '❌ Key pesan tidak valid!';
        }

        // ============================================================
        // 1. NORMALISASI KEY
        // ============================================================

        let participant = quoted.key.participant || quoted.sender || chat;
        
        if (participant && participant.endsWith('@lid')) {
            if (quoted.sender && !quoted.sender.endsWith('@lid')) {
                participant = quoted.sender;
            }
        }

        participant = normalizeJid(participant);
        const remoteJid = normalizeJid(quoted.key.remoteJid || chat);

        const pinKey = {
            remoteJid: remoteJid,
            id: quoted.key.id,
            fromMe: quoted.key.fromMe || false,
            participant: participant
        };

        console.log('[UNPIN] Final key:', JSON.stringify(pinKey, null, 2));

        // ============================================================
        // 2. KIRIM UNPIN
        // ============================================================

        try {
            await sock.sendMessage(chat, {
                pin: {
                    key: pinKey,
                    type: 0
                }
            });

            await ctx.react('✅');
            return `📌 *Pesan Dilepas!*`;

        } catch (error) {
            console.error('[UNPIN] Error:', error.message);
            await ctx.react('❌');
            
            let errorMsg = '❌ Gagal melepas pin.\n\n';
            if (error.message?.includes('not-authorized')) {
                errorMsg += '⚠️ Bot harus menjadi admin grup.';
            } else {
                errorMsg += `Error: ${error.message}`;
            }
            return errorMsg;
        }
    }
};