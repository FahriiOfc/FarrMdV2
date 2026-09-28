// command/owner/fm.js
// 🎭 Fake Message + Self Delete (hapus jejak command)

import { delay } from '@chaeulso/baileys';

export default {
    name: 'fm',
    aliases: ['fm', 'fake'],
    category: 'owner',
    description: '🎭 Edit pesan + self delete command',
    ownerOnly: true,
    groupOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, args, react, sender, isOwner, message } = ctx;

        if (!isOwner) {
            console.log(`[FM] Blocked non-owner: ${sender}`);
            return;
        }

        await react('⏳');

        // ============================================================
        // CEK REPLY & TEKS
        // ============================================================

        if (!quoted) {
            await react('❌');
            return;
        }

        if (!args || args.length === 0) {
            await react('❌');
            return;
        }

        const newText = args.join(' ');
        const stanzaId = quoted.key.id;
        const chatId = chat;

        // ============================================================
        // SIMPAN ID PESAN COMMAND UNTUK DIHAPUS
        // ============================================================

        const commandMessageId = message.key.id;

        // ============================================================
        // PROSES FAKE EDIT (fakemsg)
        // ============================================================

        try {
            // 1. Kirim pesan kosong (temp)
            const tempId = await sock.relayMessage(
                chatId,
                {
                    extendedTextMessage: {
                        text: '',
                        contextInfo: {
                            isGroupStatus: true,
                        },
                    },
                },
                {}
            );

            // 2. Kirim pesan edit
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
                                text: newText,
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
            // SELF DELETE: HAPUS PESAN COMMAND (.fm)
            // ============================================================

            // Hapus command message (pesan ".fm tes" yang kamu ketik)
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
            console.error('[FM] Error:', error);
            await react('❌');
        }
    }
};