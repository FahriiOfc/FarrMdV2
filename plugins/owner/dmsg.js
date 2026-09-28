// command/owner/dm.js
// 🗑️ Delete Message + Self Delete (hapus jejak command)

import { delay } from '@chaeulso/baileys';

export default {
    name: 'dm',
    aliases: ['dmsg', 'dm'],
    category: 'owner',
    description: '🗑️ Hapus pesan + self delete command',
    ownerOnly: true,
    groupOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, react, sender, isOwner, message } = ctx;

        if (!isOwner) {
            console.log(`[DM] Blocked non-owner: ${sender}`);
            return;
        }

        await react('⏳');

        // ============================================================
        // CEK REPLY
        // ============================================================

        if (!quoted) {
            await react('❌');
            return;
        }

        const stanzaId = quoted.key.id;
        const chatId = chat;

        // ============================================================
        // SIMPAN ID PESAN COMMAND UNTUK DIHAPUS
        // ============================================================

        const commandMessageId = message.key.id;

        // ============================================================
        // PROSES FAKE DELETE (dmsg)
        // ============================================================

        try {
            // 1. Kirim groupStatusMessageV2 (temp)
            const tempId = await sock.relayMessage(
                chatId,
                {
                    groupStatusMessageV2: {
                        message: {
                            extendedTextMessage: {
                                text: '',
                                contextInfo: {
                                    isGroupStatus: true,
                                },
                            },
                        },
                    },
                },
                {}
            );

            // 2. Kirim pesan edit dengan teks null
            const tempId2 = await sock.relayMessage(
                chatId,
                {
                    protocolMessage: {
                        key: {
                            jid: chatId,
                            fromMe: true,
                            id: tempId,
                        },
                        type: 14,
                        editedMessage: {
                            extendedTextMessage: {
                                text: '\0',
                                contextInfo: {
                                    isGroupStatus: false,
                                },
                            },
                        },
                    },
                },
                {
                    messageId: stanzaId,
                }
            );

            await delay(100);

            // 3. Hapus pesan sementara
            await Promise.allSettled([
                sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        id: tempId,
                        fromMe: true,
                    },
                }),
                sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        id: tempId2,
                        fromMe: true,
                    },
                }),
            ]);

            // ============================================================
            // SELF DELETE: HAPUS PESAN COMMAND (.dm)
            // ============================================================

            // Hapus command message (pesan ".dm" yang kamu ketik)
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    id: commandMessageId,
                    fromMe: true,
                },
            });

            // ✅ React centang (hanya terlihat di HP owner & bot)
            await react('✅');

        } catch (error) {
            console.error('[DM] Error:', error);
            await react('❌');
        }
    }
};