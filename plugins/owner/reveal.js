// command/owner/reveal.js
// 👁️ Reveal View Once messages

export default {
    name: 'reveal',
    aliases: ['unview', 'open', 'viewonce', 'rvo'],
    category: 'owner',
    description: '👁️ Reveal view once message (photo/video/VN)',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, sender, reply, react, message } = ctx;

        // ============================================================
        // CEK APAKAH REPLY KE PESAN
        // ============================================================

        if (!quoted || !quoted.message) {
            await react('❌');
            return (
                '👁️ *Reveal View Once*\n\n' +
                '❌ Reply ke pesan *View Once* (foto/video/VN) yang ingin dibuka.\n\n' +
                '📌 *Cara penggunaan:*\n' +
                '1. Cari pesan View Once di chat\n' +
                '2. Reply pesan tersebut dengan `.reveal`\n' +
                '3. Bot akan mengirim ulang isi pesan view once'
            );
        }

        // ============================================================
        // CEK APAKAH PESAN VIEW ONCE (FIXED - SUPPORT VN)
        // ============================================================

        const quotedMsg = quoted.message;

        function isViewOnceMessage(msg) {
            if (!msg) return false;
            
            // Cek dari wrapper
            if (msg.viewOnceMessage || msg.viewOnceMessageV2 || msg.viewOnceMessageV2Extension) {
                return true;
            }
            
            // Cek dari content
            const content = msg.viewOnceMessageV2?.message ||
                           msg.viewOnceMessage?.message ||
                           msg.viewOnceMessageV2Extension?.message ||
                           msg;
            
            // Cek flag viewOnce di image/video/audio
            if (content?.imageMessage?.viewOnce === true) return true;
            if (content?.videoMessage?.viewOnce === true) return true;
            if (content?.audioMessage?.viewOnce === true) return true; // ✅ TAMBAHKAN INI
            
            // Cek langsung dari quoted message
            if (msg.imageMessage?.viewOnce === true) return true;
            if (msg.videoMessage?.viewOnce === true) return true;
            if (msg.audioMessage?.viewOnce === true) return true; // ✅ TAMBAHKAN INI
            
            return false;
        }

        if (!isViewOnceMessage(quotedMsg)) {
            await react('❌');
            return '❌ Pesan yang di-reply BUKAN View Once!';
        }

        // ============================================================
        // AMBIL MEDIA DARI VIEW ONCE
        // ============================================================

        await react('⏳');

        try {
            const { downloadMediaMessage } = await import('@chaeulso/baileys');

            const buffer = await downloadMediaMessage(
                quoted,
                'buffer',
                {},
                { 
                    logger: console, 
                    reuploadRequest: sock.updateMediaMessage 
                }
            );

            if (!buffer || buffer.length === 0) {
                await react('❌');
                return '❌ Gagal mendownload media view once.';
            }

            // ============================================================
            // DETEKSI JENIS MEDIA
            // ============================================================

            let mediaType = 'document';
            let mimeType = 'application/octet-stream';
            let caption = '👁️ *Reveal View Once*';

            const content = quotedMsg.viewOnceMessageV2?.message ||
                           quotedMsg.viewOnceMessage?.message ||
                           quotedMsg.viewOnceMessageV2Extension?.message ||
                           quotedMsg;

            if (content?.imageMessage) {
                mediaType = 'image';
                mimeType = content.imageMessage.mimetype || 'image/jpeg';
                caption = content.imageMessage.caption || '👁️ *Reveal View Once*';
            } else if (content?.videoMessage) {
                mediaType = 'video';
                mimeType = content.videoMessage.mimetype || 'video/mp4';
                caption = content.videoMessage.caption || '👁️ *Reveal View Once*';
            } else if (content?.audioMessage) {
                mediaType = 'audio';
                mimeType = content.audioMessage.mimetype || 'audio/ogg; codecs=opus';
                caption = '👁️ *Reveal View Once (Voice Note)*';
            }

            // ============================================================
            // KEY PESAN YANG DI-REPLY
            // ============================================================

            const quotedKey = {
                remoteJid: quoted.key.remoteJid,
                fromMe: quoted.key.fromMe || false,
                id: quoted.key.id,
                participant: quoted.key.participant
            };

            // ============================================================
            // KIRIM MEDIA DENGAN QUOTED REPLY
            // ============================================================

            console.log(`[REVEAL] Sending ${mediaType} (${mimeType}) as quoted reply`);

            if (mediaType === 'image') {
                await sock.sendMessage(chat, {
                    image: buffer,
                    caption: caption,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [sender],
                        quotedMessage: quotedMsg,
                        stanzaId: quotedKey.id,
                        participant: quotedKey.participant || quotedKey.remoteJid
                    }
                });
            } else if (mediaType === 'video') {
                await sock.sendMessage(chat, {
                    video: buffer,
                    caption: caption,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [sender],
                        quotedMessage: quotedMsg,
                        stanzaId: quotedKey.id,
                        participant: quotedKey.participant || quotedKey.remoteJid
                    }
                });
            } else if (mediaType === 'audio') {
                await sock.sendMessage(chat, {
                    audio: buffer,
                    mimetype: mimeType,
                    ptt: true,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [sender],
                        quotedMessage: quotedMsg,
                        stanzaId: quotedKey.id,
                        participant: quotedKey.participant || quotedKey.remoteJid
                    }
                });
            } else {
                await sock.sendMessage(chat, {
                    document: buffer,
                    mimetype: mimeType,
                    fileName: `view_once_${Date.now()}.${mimeType.split('/')[1] || 'bin'}`,
                    caption: '👁️ *Reveal View Once*',
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [sender],
                        quotedMessage: quotedMsg,
                        stanzaId: quotedKey.id,
                        participant: quotedKey.participant || quotedKey.remoteJid
                    }
                });
            }

            await react('✅');
            return;

        } catch (error) {
            console.error('[REVEAL] Error:', error.message);
            await react('❌');
            return `❌ Gagal membuka view once: ${error.message}`;
        }
    }
};