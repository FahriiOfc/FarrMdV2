// plugins/owner/rstest.js
// 🎨 RS Test — Semua Reply Style (adaptasi Shiroko)
// Owner + Premium only

import sharp from 'sharp';
import axios from 'axios';
import config from '../../config.js';

// ============================================================
// KONFIGURASI
// ============================================================

const BOT_NAME = config.botName || 'FarrMdV2';
const HEADER_JID = '13135550002@s.whatsapp.net';    // Meta AI
const WA_JID = '0@s.whatsapp.net';                   // WhatsApp ✓✓
const THUMB_URL = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/gambar.jpg';

// ============================================================
// HELPER — Ambil nomor bot (untuk foto profil)
// ============================================================

function getThumbSourceNumber(sock) {
    const id = sock?.user?.id || '';
    return id.split(':')[0].split('@')[0];
}

// ============================================================
// HELPER — Thumbnail resize 300x300 (WA limit < 64KB)
// ============================================================

async function makeSmallIcon(size = 300, quality = 60) {
    try {
        const buf = Buffer.from(
            (await axios.get(THUMB_URL, { responseType: 'arraybuffer' })).data
        );
        return await sharp(buf)
            .resize(size, size, { fit: 'cover' })
            .jpeg({ quality })
            .toBuffer();
    } catch (e) {
        console.log('[RSTEST] Thumb error:', e.message);
        return null;
    }
}

// ============================================================
// FAKE QUOTES
// ============================================================

// Fake contact (WhatsApp ✓✓ + Kontak: Bot + foto profil bot)
function fakeContactQuote(sock) {
    const thumbNumber = getThumbSourceNumber(sock);

    return {
        key: {
            participant: WA_JID,
            remoteJid: 'status@broadcast',
            fromMe: false
        },
        message: {
            contactMessage: {
                displayName: `🪸 ${BOT_NAME}`,
                vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;ttname,;;;
FN:ttname
item1.TEL;waid=${thumbNumber}:+${thumbNumber}
item1.X-ABLabel:Ponsel
END:VCARD`,
                sendEphemeral: true
            }
        }
    };
}

// Fake order (WhatsApp ✓✓ + Order card + thumbnail besar)
function fakeOrderQuote(thumb, options = {}) {
    const {
        orderId = String(Math.floor(Math.random() * 999999)),
        itemCount = 999,
        message = BOT_NAME,
        orderTitle = 'System Notification',
        totalAmount1000 = '1000000',
        totalCurrencyCode = 'IDR',
        token = 'ELAINA1+'
    } = options;

    return {
        key: {
            participant: WA_JID,
            remoteJid: 'status@broadcast',
            fromMe: false
        },
        message: {
            orderMessage: {
                orderId,
                itemCount,
                status: 1,
                surface: 1,
                message,
                orderTitle,
                sellerJid: WA_JID,
                token,
                totalAmount1000,
                totalCurrencyCode,
                thumbnail: thumb
            }
        }
    };
}

// Fake location quote
function fakeLocationQuote(name = BOT_NAME, address = 'Verified Business') {
    return {
        key: {
            participant: HEADER_JID,
            remoteJid: 'status@broadcast',
            fromMe: false
        },
        message: {
            locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name,
                address,
                jpegThumbnail: null
            }
        }
    };
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'rstest',
    aliases: ['rst', 'replystyle'],
    category: 'owner',
    description: '🎨 RS Test — Semua Reply Style',
    ownerOnly: true,
    premiumOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, args, react, message } = ctx;

        await react('⏳');

        const style = (args[0] || 'list').toLowerCase();
        const text = args.slice(1).join(' ') || 'Ini pesan test dari bot';

        console.log('[RSTEST] Style:', style);

        // ============================================================
        // LIST / HELP
        // ============================================================

        if (style === 'list' || style === 'help') {
            return (
                `🎨 *RS TEST — SEMUA STYLE*\n\n` +
                `*Daftar style:*\n` +
                `> 1. contact — WhatsApp + Kontak + foto bot\n` +
                `> 2. fakeorder — WhatsApp + Order Card + thumb besar\n` +
                `> 3. location — Meta AI + 📍 nama\n` +
                `> 4. document — file .txt + 100 TB\n` +
                `> 5. documentpng — file .png + 100 TB\n` +
                `> 6. text — fake quoted + text\n` +
                `> 7. ordercard — order card standar (label katalog + harga)\n\n` +
                `💡 *Contoh:*\n` +
                `\`.rstest contact Hello\`\n` +
                `\`.rstest fakeorder 999\`\n` +
                `\`.rstest ordercard 3 150000\``
            );
        }

        // ============================================================
        // STYLE 1 — CONTACT (WhatsApp + Kontak + foto bot)
        // ============================================================

        if (style === 'contact' || style === '1') {
            const fake = fakeContactQuote(sock);
            await sock.sendMessage(
                chat,
                { text, contextInfo: { mentionedJid: [sender] } },
                { quoted: fake }
            );
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 2 — FAKE ORDER (WhatsApp + Order Card + thumb besar)
        // ============================================================

        if (style === 'fakeorder' || style === '2') {
            const itemCount = parseInt(args[1]) || 999;
            const messageText = args.slice(2).join(' ') || text;

            const thumb = await makeSmallIcon(300, 60);
            const fake = fakeOrderQuote(thumb, {
                itemCount,
                message: BOT_NAME,
                orderTitle: 'System Notification',
                totalAmount1000: String(itemCount * 1000),
                totalCurrencyCode: 'IDR'
            });

            await sock.sendMessage(
                chat,
                { text: messageText, contextInfo: { mentionedJid: [sender] } },
                { quoted: fake }
            );
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 3 — LOCATION (Meta AI + 📍)
        // ============================================================

        if (style === 'location' || style === '3') {
            const fake = fakeLocationQuote(BOT_NAME, 'Verified Business');
            await sock.sendMessage(
                chat,
                { text, contextInfo: { mentionedJid: [sender] } },
                { quoted: fake }
            );
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 4 — DOCUMENT .txt + 100 TB
        // ============================================================

        if (style === 'document' || style === '4') {
            const thumb = await makeSmallIcon(300, 60);
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
                participant: WA_JID,
                remoteJid: 'status@broadcast',
                quotedMessage: {
                    contactMessage: {
                        displayName: `🪸 ${BOT_NAME}`,
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${BOT_NAME}
TEL;type=CELL;type=VOICE;waid=${getThumbSourceNumber(sock)}:+${getThumbSourceNumber(sock)}
END:VCARD`
                    }
                },
                jpegThumbnail: thumb
            };

            await sock.relayMessage(chat, { documentMessage: upload.documentMessage }, {});
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 5 — DOCUMENT PNG + 100 TB
        // ============================================================

        if (style === 'documentpng' || style === '5') {
            const thumb = await makeSmallIcon(300, 60);
            const img = await makeSmallIcon(800, 85);
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
                participant: WA_JID,
                remoteJid: 'status@broadcast',
                quotedMessage: {
                    contactMessage: {
                        displayName: `🪸 ${BOT_NAME}`,
                        vcard: `BEGIN:VCARD
VERSION:3.0
FN:${BOT_NAME}
TEL;type=CELL;type=VOICE;waid=${getThumbSourceNumber(sock)}:+${getThumbSourceNumber(sock)}
END:VCARD`
                    }
                },
                jpegThumbnail: thumb
            };

            await sock.relayMessage(chat, { documentMessage: upload.documentMessage }, {});
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 6 — TEXT + fake quoted
        // ============================================================

        if (style === 'text' || style === '6') {
            const fake = fakeContactQuote(sock);
            await sock.sendMessage(
                chat,
                { text, contextInfo: { mentionedJid: [sender] } },
                { quoted: fake }
            );
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE 7 — ORDER CARD (label katalog + total harga)
        // ============================================================

        if (style === 'ordercard' || style === '7') {
            const itemCount = parseInt(args[1]) || 3;
            const amount = parseInt(args[2]) || 150000;
            const messageText = args.slice(3).join(' ') || text;

            const thumb = await makeSmallIcon(300, 60);

            await sock.relayMessage(chat, {
                orderMessage: {
                    itemCount,
                    status: 'PENDING',
                    surface: 1,
                    message: messageText,
                    orderTitle: BOT_NAME,
                    sellerJid: sock.user?.id,
                    totalAmount1000: amount * 1000,
                    totalCurrencyCode: 'IDR',
                    thumbnail: thumb
                }
            }, {});
            await react('✅');
            return;
        }

        // ============================================================
        // STYLE TIDAK DIKENAL
        // ============================================================

        await react('❌');
        return `❌ Style tidak dikenal: *${style}*\n\nKetik \`.rstest list\``;
    }
};