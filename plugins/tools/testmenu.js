// plugins/tools/testmenu.js
// Test lengkap — semua style dengan header img/gif

import { AIRich, Button, ButtonV2, Carousel, VERSION } from '../../lib/MessageBuilder.js';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const THUMB_IMG = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/gambar.jpg';
const THUMB_VID = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/video.mp4';

export default {
    name: 'testmenu',
    aliases: ['tmenu', 'testmsg'],
    category: 'tools',
    description: '🧪 Test semua style dengan header img/gif',
    ownerOnly: true,
    premiumOnly: true,

    async execute(ctx) {
        const { sock, chat, args } = ctx;
        await ctx.react('⏳');

        const mode = (args[0] || 'help').toLowerCase();

        console.log(`[TESTMENU] Mode: ${mode}`);

        // ============================================================
        // HELP
        // ============================================================

        if (mode === 'help') {
            return (
                `🧪 *Test Menu — FarrMD*\n\n` +
                `*Header Image:*\n` +
                `• \`.testmenu buttonimg\` — Button + Image\n` +
                `• \`.testmenu listimg\` — List + Image\n` +
                `• \`.testmenu legacyimg\` — ButtonV2 + Image\n` +
                `• \`.testmenu airichimg\` — AIRich + Image\n\n` +
                `*Header Video GIF:*\n` +
                `• \`.testmenu buttongif\` — Button + Video GIF\n` +
                `• \`.testmenu listgif\` — List + Video GIF\n` +
                `• \`.testmenu airichgif\` — AIRich + Video\n\n` +
                `*Tanpa Header:*\n` +
                `• \`.testmenu button\` — Button biasa\n` +
                `• \`.testmenu list\` — List biasa\n` +
                `• \`.testmenu legacy\` — ButtonV2\n` +
                `• \`.testmenu carousel\` — Carousel\n\n` +
                `*FarrMD v${VERSION}*`
            );
        }

        // ============================================================
        // BUTTON + IMAGE
        // ============================================================

        if (mode === 'buttonimg') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · Button + Image');
            btn.setBody('Button dengan image header:');
            btn.setFooter('FarrMD v' + VERSION);
            btn.setImage(THUMB_IMG);

            btn.addReply('📋 Menu', 'menu');
            btn.addReply('👤 Owner', 'owner');
            btn.addReply('⚡ Ping', 'ping');

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // BUTTON + VIDEO GIF
        // ============================================================

        if (mode === 'buttongif') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · Button + Video GIF');
            btn.setBody('Button dengan video autoplay header:');
            btn.setFooter('FarrMD v' + VERSION);

            btn.setMedia({
                video: { url: THUMB_VID },
                gifPlayback: true
            });

            btn.addReply('📋 Menu', 'menu');
            btn.addReply('👤 Owner', 'owner');
            btn.addReply('⚡ Ping', 'ping');

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // BUTTON BIASA
        // ============================================================

        if (mode === 'button') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · Button');
            btn.setBody('Button tanpa header:');
            btn.setFooter('FarrMD v' + VERSION);

            btn.addReply('📋 Menu', 'menu');
            btn.addReply('👤 Owner', 'owner');
            btn.addReply('⚡ Ping', 'ping');

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // LIST + IMAGE
        // ============================================================

        if (mode === 'listimg') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · List + Image');
            btn.setBody('List dengan image header:');
            btn.setFooter('FarrMD v' + VERSION);
            btn.setImage(THUMB_IMG);

            btn.addSelection('📋 Menu Utama', {
                sections: [
                    {
                        title: 'Main',
                        rows: [
                            { title: '📋 Menu', description: 'Tampilkan menu', id: 'menu' },
                            { title: '⚡ Ping', description: 'Cek latency', id: 'ping' },
                            { title: '⏱️ Runtime', description: 'Uptime bot', id: 'runtime' }
                        ]
                    },
                    {
                        title: 'Owner',
                        rows: [
                            { title: '👤 Owner', description: 'Kontak owner', id: 'owner' }
                        ]
                    }
                ]
            });

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // LIST + VIDEO GIF
        // ============================================================

        if (mode === 'listgif') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · List + Video GIF');
            btn.setBody('List dengan video autoplay header:');
            btn.setFooter('FarrMD v' + VERSION);

            btn.setMedia({
                video: { url: THUMB_VID },
                gifPlayback: true
            });

            btn.addSelection('📋 Menu Utama', {
                sections: [
                    {
                        title: 'Main',
                        rows: [
                            { title: '📋 Menu', description: 'Tampilkan menu', id: 'menu' },
                            { title: '⚡ Ping', description: 'Cek latency', id: 'ping' },
                            { title: '⏱️ Runtime', description: 'Uptime bot', id: 'runtime' }
                        ]
                    }
                ]
            });

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // LIST BIASA
        // ============================================================

        if (mode === 'list') {
            const btn = new Button(sock);
            btn.setTitle('FarrMD · List');
            btn.setBody('List tanpa header:');
            btn.setFooter('FarrMD v' + VERSION);

            btn.addSelection('📋 Menu Utama', {
                sections: [
                    {
                        title: 'Main',
                        rows: [
                            { title: '📋 Menu', description: 'Tampilkan menu', id: 'menu' },
                            { title: '⚡ Ping', description: 'Cek latency', id: 'ping' }
                        ]
                    }
                ]
            });

            await btn.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // BUTTONV2 + IMAGE
        // ============================================================

        if (mode === 'legacyimg') {
            const btnv2 = new ButtonV2(sock);
            btnv2.setTitle('FarrMD');
            btnv2.setSubtitle('Legacy + Image');
            btnv2.setBody('Legacy button dengan thumbnail image:');
            btnv2.setFooter('FarrMD v' + VERSION);
            btnv2.setThumbnail(THUMB_IMG);

            btnv2.addButton('📋 Menu', 'menu');
            btnv2.addButton('👤 Owner', 'owner');
            btnv2.addButton('⚡ Ping', 'ping');

            await btnv2.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // BUTTONV2 LEGACY BIASA
        // ============================================================

        if (mode === 'legacy') {
            const btnv2 = new ButtonV2(sock);
            btnv2.setTitle('FarrMD');
            btnv2.setSubtitle('Legacy');
            btnv2.setBody('Legacy button tanpa thumbnail:');
            btnv2.setFooter('FarrMD v' + VERSION);

            btnv2.addButton('📋 Menu', 'menu');
            btnv2.addButton('👤 Owner', 'owner');
            btnv2.addButton('⚡ Ping', 'ping');

            await btnv2.send(chat);
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // CAROUSEL
        // ============================================================

        if (mode === 'carousel') {
            try {
                const carousel = new Carousel(sock);
                carousel.setBody('Ini contoh carousel:');
                carousel.setFooter('FarrMD v' + VERSION);

                const { prepareWAMessageMedia } = await import('@chaeulso/baileys');

                const imgBuffer = await fetch(THUMB_IMG)
                    .then(r => r.arrayBuffer())
                    .then(b => Buffer.from(b));

                const makeCard = async (title, body, buttonId) => {
                    const media = await prepareWAMessageMedia(
                        { image: imgBuffer },
                        { upload: sock.waUploadToServer }
                    );
                    return {
                        header: {
                            title,
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        },
                        body: { text: body },
                        footer: { text: 'FarrMD' },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: `Pilih ${title}`,
                                        id: buttonId
                                    })
                                }
                            ]
                        }
                    };
                };

                carousel.addCard([
                    await makeCard('Card 1', 'Ini card pertama', 'card1'),
                    await makeCard('Card 2', 'Ini card kedua', 'card2'),
                    await makeCard('Card 3', 'Ini card ketiga', 'card3')
                ]);

                await carousel.send(chat);
                await ctx.react('✅');
            } catch (e) {
                console.error('[TESTMENU] Carousel error:', e.message);
                await ctx.reply(`❌ Carousel error: ${e.message}`);
                await ctx.react('❌');
            }
            return;
        }

        // ============================================================
        // AIRICH + IMAGE
        // ============================================================

        if (mode === 'airichimg') {
            const rich = new AIRich(sock);
            rich.setTitle('FarrMD · AIRich + Image');
            rich.setFooter('FarrMD v' + VERSION);

            rich.addText('🖼️ *AIRich dengan image header:*');
            rich.addImage(THUMB_IMG, { width: 600, height: 400 });
            rich.addText('Pilih menu di bawah:');
            rich.addSuggest(['Menu', 'Owner', 'Help']);

            await rich.send(chat, { forwarded: true });
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // AIRICH + VIDEO
        // ============================================================

        if (mode === 'airichgif') {
            const rich = new AIRich(sock);
            rich.setTitle('FarrMD · AIRich + Video');
            rich.setFooter('FarrMD v' + VERSION);

            rich.addText('🎬 *AIRich dengan video header:*');
            rich.addVideo({
                url: THUMB_VID,
                duration: 16,
                file_length: 3320105,
                mime_type: 'video/mp4',
                thumbnail: THUMB_IMG
            }, { autoFill: false, status: 'READY' });
            rich.addText('Pilih menu di bawah:');
            rich.addSuggest(['Menu', 'Owner', 'Help']);

            await rich.send(chat, { forwarded: true });
            await ctx.react('✅');
            return;
        }

        // ============================================================
        // FALLBACK
        // ============================================================

        return '❌ Style tidak dikenal. Ketik `.testmenu help`';
    }
};
