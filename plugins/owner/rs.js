// plugins/owner/rs.js
// 🎨 Reply Style — Test semua style (adaptasi Shiroko Fork)
// Owner + Premium only

import sharp from 'sharp';
import axios from 'axios';
import config from '../../config.js';

// ============================================================
// KONFIGURASI
// ============================================================

const BOT_NAME = config.botName || 'FarrMdV2';

// Header JID — Meta AI (untuk centang biru + "Meta AI • Status")
const HEADER_JID = '13135550002@s.whatsapp.net';

// Thumbnail fallback
const THUMB_URL = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/gambar.jpg';

// ============================================================
// HELPER — Ambil nomor bot (untuk foto profil)
// ============================================================

function getThumbSourceNumber(sock) {
    const id = sock?.user?.id || '';
    return id.split(':')[0].split('@')[0];
}

// ============================================================
// HELPER — Thumbnail dari URL
// ============================================================

async function getThumbnail(size = 200, quality = 70) {
    try {
        const buf = Buffer.from(
            (await axios.get(THUMB_URL, { responseType: 'arraybuffer' })).data
        );
        return await sharp(buf)
            .resize(size, size, { fit: 'cover' })
            .jpeg({ quality })
            .toBuffer();
    } catch (e) {
        console.log('[RS] Thumb error:', e.message);
        return null;
    }
}

// ============================================================
// HELPER — Fake Quoted Context
// participant = HEADER_JID (Meta AI)
// vcard.waid = nomor bot (foto profil)
// ============================================================

function fakeContext(sock, options = {}) {
    const {
        headerJid = HEADER_JID,
        displayName = BOT_NAME,
        remoteJid = 'status@broadcast'
    } = options;

    const thumbNumber = getThumbSourceNumber(sock);

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
N:${displayName};;;;
TEL;type=CELL;type=VOICE;waid=${thumbNumber}:+${headerJid.split('@')[0]}
END:VCARD`;

    return {
        quotedMessage: {
            contactMessage: {
                displayName,
                vcard
            }
        },
        stanzaId: 'FAKE_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        participant: headerJid,
        remoteJid
    };
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'rstest',
    aliases: ['replystyle', 'teststyle'],
    category: 'owner',
    description: '🎨 Test Reply Style (adaptasi Shiroko)',
    ownerOnly: true,
    premiumOnly: true,

    async execute(ctx) {
        const { sock, chat, args, react } = ctx;

        await react('⏳');

        const style = (args[0] || 'list').toLowerCase();
        const text = args.slice(1).join(' ') || 'Ini pesan test dari bot';

        console.log('[RS] Style:', style);
        console.log('[RS] Thumb source:', getThumbSourceNumber(sock));

        // ============================================================
        // LIST / HELP
        // ============================================================

        if (style === 'list' || style === 'help') {
            return (
                `🎨 *REPLY STYLE — TEST*\n\n` +
                `*Daftar style:*\n` +
                `> 1. contact — vCard + Meta AI centang biru\n` +
                `> 2. location — location + nama + address\n` +
                `> 3. document — file .txt + fake 100 TB\n` +
                `> 4. documentpng — file .png + fake 100 TB\n` +
                `> 5. fakeorder — order + fake quoted (thumb besar kanan)\n` +
                `> 6. text — fake quoted + text\n` +
                `> 11. ordercard — order card standar (label katalog + harga)\n\n` +
                `💡 *Contoh:*\n` +
                `\`.rs contact Hello semua\`\n` +
                `\`.rs document Test dokumen\`\n` +
                `\`.rs fakeorder 999\`\n` +
                `\`.rs ordercard 3 150000 Terima kasih\``
            );
        }

        // ============================================================
        // STYLE 1 — CONTACT (Meta AI + thumb bot)
        // ============================================================

        if (style === 'contact' || style === '1') {
            const contextInfo = fakeContext(sock);
            await sock.sendMessage(chat, { text, contextInfo });
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 2 — LOCATION
        // ============================================================

        if (style === 'location' || style === '2') {
            await sock.sendMessage(chat, {
                text,
                contextInfo: {
                    quotedMessage: {
                        locationMessage: {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: BOT_NAME,
                            address: 'Verified Business'
                        }
                    },
                    stanzaId: 'FAKE_' + Date.now(),
                    participant: HEADER_JID,
                    remoteJid: 'status@broadcast'
                }
            });
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 3 — DOCUMENT .txt + 100 TB
        // ============================================================

        if (style === 'document' || style === '3') {
            const thumb = await getThumbnail(100, 60);
            const { prepareWAMessageMedia } = await import('@chaeulso/baileys');

            const upload = await prepareWAMessageMedia(
                {
                    document: Buffer.from(text),
                    mimetype: 'application/octet-stream',
                    fileName: `${BOT_NAME}.bin`
                },
                { upload: sock.waUploadToServer }
            );

            upload.documentMessage.fileLength = '100000000000000';
            upload.documentMessage.fileName = `${BOT_NAME}.txt`;
            upload.documentMessage.jpegThumbnail = thumb;
            upload.documentMessage.contextInfo = {
                ...fakeContext(sock),
                jpegThumbnail: thumb
            };

            await sock.relayMessage(chat, { documentMessage: upload.documentMessage }, {});
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 4 — DOCUMENT PNG + 100 TB
        // ============================================================

        if (style === 'documentpng' || style === '4') {
            const thumb = await getThumbnail(100, 60);
            const img = await getThumbnail(800, 85);
            const { prepareWAMessageMedia } = await import('@chaeulso/baileys');

            const upload = await prepareWAMessageMedia(
                {
                    document: img,
                    mimetype: 'image/png',
                    fileName: `${BOT_NAME}.png`
                },
                { upload: sock.waUploadToServer }
            );

            upload.documentMessage.fileLength = '100000000000000';
            upload.documentMessage.fileName = `${BOT_NAME}.png`;
            upload.documentMessage.jpegThumbnail = thumb;
            upload.documentMessage.contextInfo = {
                ...fakeContext(sock),
                jpegThumbnail: thumb
            };

            await sock.relayMessage(chat, { documentMessage: upload.documentMessage }, {});
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 5 — FAKE ORDER
        // (order + fake quoted, thumb besar di kanan, tanpa harga)
        // ============================================================

        if (style === 'fakeorder' || style === '5') {
            const thumb = await getThumbnail(400, 80);
            const itemCount = parseInt(args[1]) || 999;
            const message = args.slice(2).join(' ') || text;

            await sock.relayMessage(chat, {
                orderMessage: {
                    itemCount,
                    status: 'PENDING',
                    surface: 1,
                    message,
                    orderTitle: BOT_NAME,
                    sellerJid: sock.user?.id,
                    totalAmount1000: 0,                    // ← 0 = tidak tampil harga
                    totalCurrencyCode: 'IDR',
                    thumbnail: thumb,
                    contextInfo: fakeContext(sock)          // ← fake quoted
                }
            }, {});

            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 6 — TEXT + FAKE QUOTED
        // ============================================================

        if (style === 'text' || style === '6') {
            const contextInfo = fakeContext(sock);
            await sock.sendMessage(chat, { text, contextInfo });
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 11 — ORDER CARD
        // (order card standar, label katalog + harga, thumb kecil kiri)
        // ============================================================

        if (style === 'ordercard' || style === '11') {
            const thumb = await getThumbnail(300, 75);
            const itemCount = parseInt(args[1]) || 3;
            const amount = parseInt(args[2]) || 150000;
            const message = args.slice(3).join(' ') || text;

            await sock.relayMessage(chat, {
                orderMessage: {
                    itemCount,
                    status: 'PENDING',
                    surface: 1,
                    message,
                    orderTitle: BOT_NAME,
                    sellerJid: sock.user?.id,
                    totalAmount1000: amount * 1000,         // ← tampil harga
                    totalCurrencyCode: 'IDR',
                    thumbnail: thumb
                    // ← TIDAK ada contextInfo.quotedMessage
                }
            }, {});

            await react('✅');
            return;
        }

        // ============================================================
        // STYLE TIDAK DIKENAL
        // ============================================================

        await react('❌');
        return `❌ Style tidak dikenal: *${style}*\n\nKetik \`.rs list\` untuk lihat daftar.`;
    }
};