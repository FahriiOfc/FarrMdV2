// plugins/owner/wabiz.js
// 🏢 Test WA Business Features
// Owner only

import sharp from 'sharp';
import axios from 'axios';
import config from '../../config.js';

const BOT_NAME = config.botName || 'FarrMdV2';
const THUMB_URL = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/gambar.jpg';

// ============================================================
// HELPER — Thumbnail
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
        console.log('[WABIZ] Thumb error:', e.message);
        return null;
    }
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'wabiz',
    aliases: ['wabusiness', 'wab'],
    category: 'owner',
    description: '🏢 Test WA Business Features',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, args, react } = ctx;

        await react('⏳');

        const mode = (args[0] || 'help').toLowerCase();
        console.log('[WABIZ] Mode:', mode);

        // ============================================================
        // HELP
        // ============================================================

        if (mode === 'help' || mode === 'list') {
            return (
                `🏢 *WA BUSINESS TEST*\n\n` +
                `*Fitur yang bisa dites:*\n` +
                `> 1. headerimg — Button + Image header (headerType 4)\n` +
                `> 2. product — Product card (productMessage)\n` +
                `> 3. catalog — Catalog message\n` +
                `> 4. order — Order message valid\n` +
                `> 5. cart — Cart message\n` +
                `> 6. interactive — Interactive native flow\n` +
                `> 7. button — Buttons full (headerType 1-6)\n` +
                `> 8. all — Semua test sekaligus\n\n` +
                `💡 Contoh:\n` +
                `\`.wabiz headerimg\`\n` +
                `\`.wabiz product\``
            );
        }

        // ============================================================
        // 1. HEADER IMAGE (headerType 4) — WA BUSINESS ONLY
        // ============================================================

        if (mode === 'headerimg' || mode === '1') {
            const thumb = await makeSmallIcon(300, 70);

            const payload = {
                buttonsMessage: {
                    contentText: 'Test header image — WA Business only 🏢',
                    footerText: BOT_NAME,
                    buttons: [
                        {
                            buttonId: 'confirm',
                            buttonText: { displayText: '✅ Konfirmasi' },
                            type: 1
                        },
                        {
                            buttonId: 'cancel',
                            buttonText: { displayText: '❌ Batalkan' },
                            type: 1
                        }
                    ],
                    headerType: 4,
                    imageMessage: {
                        url: THUMB_URL,
                        mimetype: 'image/jpeg',
                        caption: 'Header Image',
                        jpegThumbnail: thumb
                    },
                    contextInfo: {
                        forwardingScore: 9999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363410132471398@newsletter',
                            newsletterName: BOT_NAME,
                            serverMessageId: 127
                        }
                    }
                }
            };

            try {
                const { generateWAMessageFromContent } = await import('@chaeulso/baileys');
                const msg = generateWAMessageFromContent(chat, payload, {});

                await sock.relayMessage(chat, msg.message, {
                    messageId: msg.key.id,
                    additionalNodes: [
                        {
                            tag: 'biz',
                            attrs: {},
                            content: [
                                {
                                    tag: 'interactive',
                                    attrs: { type: 'native_flow', v: '1' },
                                    content: [
                                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                await react('✅');
                return '✅ Header image test terkirim';
            } catch (e) {
                console.error('[WABIZ] headerimg error:', e.message);
                await react('❌');
                return `❌ Error: ${e.message}`;
            }
        }

        // ============================================================
        // 2. PRODUCT MESSAGE
        // ============================================================

        if (mode === 'product' || mode === '2') {
            try {
                const { generateWAMessageFromContent, prepareWAMessageMedia } = await import('@chaeulso/baileys');

                const imgBuf = Buffer.from(
                    (await axios.get(THUMB_URL, { responseType: 'arraybuffer' })).data
                );

                const media = await prepareWAMessageMedia(
                    { image: imgBuf },
                    { upload: sock.waUploadToServer }
                );

                const payload = {
                    productMessage: {
                        product: {
                            productImage: media.imageMessage,
                            productId: 'FARR-PROD-001',
                            title: 'FarrMdV2 Premium',
                            description: 'Bot WhatsApp Premium\nFitur lengkap + support',
                            currencyCode: 'IDR',
                            priceAmount1000: '99999000',
                            retailerId: 'FARRSTORE',
                            url: 'https://wa.me/6285893028915',
                            productImageCount: 1
                        },
                        businessOwnerJid: sock.user?.id
                    }
                };

                const msg = generateWAMessageFromContent(chat, payload, {});
                await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

                await react('✅');
                return '✅ Product message terkirim';
            } catch (e) {
                console.error('[WABIZ] product error:', e.message);
                await react('❌');
                return `❌ Product error: ${e.message}`;
            }
        }

        // ============================================================
        // 3. CATALOG MESSAGE
        // ============================================================

        if (mode === 'catalog' || mode === '3') {
            try {
                const { generateWAMessageFromContent } = await import('@chaeulso/baileys');

                const payload = {
                    productMessage: {
                        product: {
                            productId: 'FARR-CATALOG-001',
                            title: 'FarrMdV2 Catalog',
                            description: 'Katalog produk FarrStore',
                            currencyCode: 'IDR',
                            priceAmount1000: '0',
                            retailerId: 'FARRSTORE',
                            url: 'https://wa.me/6285893028915'
                        },
                        businessOwnerJid: sock.user?.id,
                        catalogMessage: {
                            catalogId: 'FARR-CAT-001',
                            catalogName: 'FarrStore Catalog'
                        }
                    }
                };

                const msg = generateWAMessageFromContent(chat, payload, {});
                await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

                await react('✅');
                return '✅ Catalog message terkirim';
            } catch (e) {
                console.error('[WABIZ] catalog error:', e.message);
                await react('❌');
                return `❌ Catalog error: ${e.message}`;
            }
        }

        // ============================================================
        // 4. ORDER MESSAGE (Valid)
        // ============================================================

        if (mode === 'order' || mode === '4') {
            try {
                const { generateWAMessageFromContent } = await import('@chaeulso/baileys');
                const thumb = await makeSmallIcon(300, 70);

                const payload = {
                    orderMessage: {
                        orderId: String(Date.now()),
                        thumbnail: thumb,
                        itemCount: 3,
                        status: 1,
                        surface: 1,
                        message: 'Order dari WhatsApp Business',
                        orderTitle: 'FarrStore Order',
                        sellerJid: sock.user?.id,
                        token: 'ELAINA1+',
                        totalAmount1000: '150000000',
                        totalCurrencyCode: 'IDR'
                    }
                };

                const msg = generateWAMessageFromContent(chat, payload, {});
                await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

                await react('✅');
                return '✅ Order message terkirim';
            } catch (e) {
                console.error('[WABIZ] order error:', e.message);
                await react('❌');
                return `❌ Order error: ${e.message}`;
            }
        }

        // ============================================================
        // 5. CART MESSAGE
        // ============================================================

        if (mode === 'cart' || mode === '5') {
            try {
                const { generateWAMessageFromContent } = await import('@chaeulso/baileys');

                const payload = {
                    orderMessage: {
                        orderId: 'CART-' + Date.now(),
                        itemCount: 2,
                        status: 1,
                        surface: 1,
                        message: 'Cart test',
                        orderTitle: 'FarrStore Cart',
                        sellerJid: sock.user?.id,
                        token: 'ELAINA1+',
                        totalAmount1000: '100000000',
                        totalCurrencyCode: 'IDR'
                    }
                };

                const msg = generateWAMessageFromContent(chat, payload, {});
                await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

                await react('✅');
                return '✅ Cart message terkirim';
            } catch (e) {
                console.error('[WABIZ] cart error:', e.message);
                await react('❌');
                return `❌ Cart error: ${e.message}`;
            }
        }

        // ============================================================
        // 6. INTERACTIVE NATIVE FLOW
        // ============================================================

        if (mode === 'interactive' || mode === '6') {
            try {
                const thumb = await makeSmallIcon(300, 70);
                const { Button } = await import('../../lib/MessageBuilder.js');

                const btn = new Button(sock);
                btn.setTitle('Interactive Test');
                btn.setBody('Test native flow dari WA Business');
                btn.setFooter(BOT_NAME);
                btn.setImage(THUMB_URL);

                btn.addSelection('📋 Menu', {
                    sections: [
                        {
                            title: 'Main',
                            rows: [
                                { title: 'Menu', description: 'Tampilkan menu', id: 'menu' },
                                { title: 'Owner', description: 'Kontak owner', id: 'owner' },
                                { title: 'Ping', description: 'Cek latency', id: 'ping' }
                            ]
                        }
                    ]
                });

                btn.addReply('✅ Konfirmasi', 'confirm');

                await btn.send(chat);
                await react('✅');
                return '✅ Interactive terkirim';
            } catch (e) {
                console.error('[WABIZ] interactive error:', e.message);
                await react('❌');
                return `❌ Interactive error: ${e.message}`;
            }
        }

        // ============================================================
        // 7. BUTTON FULL (headerType 1-6)
        // ============================================================

        if (mode === 'button' || mode === '7') {
            const headerType = parseInt(args[1]) || 6;
            const thumb = await makeSmallIcon(300, 70);

            const headerTypes = {
                1: 'TEXT',
                2: 'VIDEO',
                3: 'IMAGE',
                4: 'IMAGE (WA Biz only)',
                5: 'PRODUCT',
                6: 'LOCATION'
            };

            const payload = {
                buttonsMessage: {
                    contentText: `Test headerType: ${headerType} (${headerTypes[headerType] || 'unknown'})`,
                    footerText: BOT_NAME,
                    buttons: [
                        { buttonId: 'btn1', buttonText: { displayText: '✅ Button 1' }, type: 1 },
                        { buttonId: 'btn2', buttonText: { displayText: '❌ Button 2' }, type: 1 }
                    ],
                    headerType,
                    ...(headerType === 6 ? {
                        locationMessage: {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: BOT_NAME,
                            address: 'Test',
                            jpegThumbnail: thumb
                        }
                    } : {}),
                    ...(headerType === 4 ? {
                        imageMessage: {
                            url: THUMB_URL,
                            mimetype: 'image/jpeg',
                            jpegThumbnail: thumb
                        }
                    } : {})
                }
            };

            try {
                const { generateWAMessageFromContent } = await import('@chaeulso/baileys');
                const msg = generateWAMessageFromContent(chat, payload, {});
                await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

                await react('✅');
                return `✅ headerType ${headerType} terkirim`;
            } catch (e) {
                console.error('[WABIZ] button error:', e.message);
                await react('❌');
                return `❌ Error: ${e.message}`;
            }
        }

        // ============================================================
        // 8. ALL — Test semua sekaligus
        // ============================================================

        if (mode === 'all' || mode === '8') {
            const modes = ['headerimg', 'product', 'catalog', 'order', 'cart', 'interactive', 'button'];

            await ctx.reply(`🏢 *Test semua fitur WA Business...*\n\n_Proses ${modes.length} test bertahap._`);

            for (const m of modes) {
                try {
                    // Rekursif panggil execute dengan mode
                    await this.execute({ ...ctx, args: [m] });
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    console.error(`[WABIZ] all-${m} error:`, e.message);
                }
            }

            await react('✅');
            return '✅ Semua test selesai';
        }

        // ============================================================
        // UNKNOWN MODE
        // ============================================================

        await react('❌');
        return `❌ Mode tidak dikenal: *${mode}*\n\nKetik \`.wabiz help\``;
    }
};