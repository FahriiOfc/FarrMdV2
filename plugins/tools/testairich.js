// plugins/tools/testairich.js
// Test AIRich — pola insertAt sequential (seperti MessageBuilderV4.7 demo)

import { AIRich, VERSION } from '../../lib/MessageBuilder.js';

const SAMPLE_IMG = 'https://picsum.photos/600/400';
const SAMPLE_VID = 'https://www.w3schools.com/html/mov_bbb.mp4';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export default {
    name: 'testairich',
    aliases: ['tairich', 'testrich'],
    category: 'tools',
    description: '🧪 Test AIRich sequential (insertAt)',
    ownerOnly: true,
    premiumOnly: true,

    async execute(ctx) {
        const { sock, chat } = ctx;
        await ctx.react('⏳');

        console.log('[TESTAIRICH] === Start ===');

        // ============================================================
        // INSTANCE TUNGGAL — dipakai dari awal sampai akhir
        // ============================================================

        const rich = new AIRich(sock);
        rich.setTitle('FarrMD · AIRich Sequential');
        rich.setFooter('FarrMD v' + VERSION);

        // ============================================================
        // STEP 1 — INTRO
        // ============================================================

        rich.addText('👋 *Selamat datang di AIRich Sequential!*', { id: 'intro' });
        await rich.send(chat, { forwarded: true });
        console.log('[TESTAIRICH] Step 1 OK');
        await delay(1500);

        // ============================================================
        // STEP 2 — HYPERLINK
        // ============================================================

        rich.addText('🔗 Hyperlink: [Google](https://google.com)', { insertAt: 'intro', id: 'link' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 2 OK');
        await delay(1500);

        // ============================================================
        // STEP 3 — METADATA
        // ============================================================

        rich.addMetadata('📌 Metadata: info kecil di bawah', { insertAt: 'link', id: 'meta' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 3 OK');
        await delay(1500);

        // ============================================================
        // STEP 4 — TIP
        // ============================================================

        rich.addTip('Ketik .menu untuk lihat command', { insertAt: 'meta', id: 'tip' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 4 OK');
        await delay(1500);

        // ============================================================
        // STEP 5 — CODE
        // ============================================================

        rich.addText('📝 *Code Block:*', { insertAt: 'tip', id: 'code-title' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 5a OK');
        await delay(1500);

        rich.addCode('javascript', `function hello(name) {
    const greeting = \`Halo, \${name}!\`;
    console.log(greeting);
    return greeting;
}
hello('FarrMD');`, { insertAt: 'code-title', id: 'code' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 5 OK');
        await delay(1500);

        // ============================================================
        // STEP 6 — TABLE
        // ============================================================

        rich.addText('📊 *Table:*', { insertAt: 'code', id: 'table-title' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 6a OK');
        await delay(1500);

        rich.addTable([
            ['Command', 'Fungsi', 'Status'],
            ['menu', 'Tampilkan menu', '✅'],
            ['ping', 'Cek latency', '✅'],
            ['runtime', 'Uptime bot', '✅'],
            ['testairich', 'Test AIRich', '✅']
        ], { insertAt: 'table-title', id: 'table' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 6 OK');
        await delay(1500);

        // ============================================================
        // STEP 7 — IMAGE
        // ============================================================

        rich.addText('🖼️ *Image:*', { insertAt: 'table', id: 'image-title' });
        await rich.sendEdit();
        await delay(1500);

        rich.addImage(SAMPLE_IMG, {
            width: 600,
            height: 400,
            status: 'READY',
            update_text: 'Gambar siap',
            insertAt: 'image-title',
            id: 'image'
        });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 7 OK');
        await delay(1500);

        // ============================================================
        // STEP 8 — VIDEO
        // ============================================================

        rich.addText('🎬 *Video:*', { insertAt: 'image', id: 'video-title' });
        await rich.sendEdit();
        await delay(1500);

        rich.addVideo(SAMPLE_VID, {
            autoFill: false,
            status: 'READY',
            insertAt: 'video-title',
            id: 'video'
        });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 8 OK');
        await delay(1500);

        // ============================================================
        // STEP 9 — SOURCE
        // ============================================================

        rich.addText('📚 *Source:*', { insertAt: 'video', id: 'source-title' });
        await rich.sendEdit();
        await delay(1500);

        rich.addSource([
            {
                url: 'https://github.com',
                title: 'GitHub',
                subtitle: 'Platform developer',
                icon: 'https://github.githubassets.com/favicons/favicon.png'
            },
            {
                url: 'https://stackoverflow.com',
                title: 'Stack Overflow',
                subtitle: 'Q&A programming',
                icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
            }
        ], { insertAt: 'source-title', id: 'source' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 9 OK');
        await delay(1500);

        // ============================================================
        // STEP 10 — PRODUCT
        // ============================================================

        rich.addText('🛍️ *Product:*', { insertAt: 'source', id: 'product-title' });
        await rich.sendEdit();
        await delay(1500);

        rich.addProduct([
            {
                title: 'FarrMD Premium',
                brand: 'FarrDev',
                price: 'Rp 50.000',
                sale_price: 'Rp 35.000',
                product_url: 'https://example.com/premium',
                image_url: SAMPLE_IMG,
                icon_url: SAMPLE_IMG
            },
            {
                title: 'FarrMD VIP',
                brand: 'FarrDev',
                price: 'Rp 100.000',
                sale_price: 'Rp 75.000',
                product_url: 'https://example.com/vip',
                image_url: SAMPLE_IMG,
                icon_url: SAMPLE_IMG
            }
        ], { insertAt: 'product-title', id: 'product' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 10 OK');
        await delay(1500);

        // ============================================================
        // STEP 11 — POST
        // ============================================================

        rich.addText('📱 *Post:*', { insertAt: 'product', id: 'post-title' });
        await rich.sendEdit();
        await delay(1500);

        rich.addPost({
            username: 'farrdev',
            title: 'Post Instagram',
            subtitle: 'Update fitur terbaru',
            profile_picture_url: SAMPLE_IMG,
            thumbnail_url: SAMPLE_IMG,
            post_caption: 'AIRich di FarrMD sudah support!',
            likes_count: 1520,
            comments_count: 89,
            shares_count: 34,
            post_url: 'https://instagram.com/p/xxx',
            source_app: 'INSTAGRAM',
            is_verified: true
        }, { insertAt: 'post-title', id: 'post' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 11 OK');
        await delay(1500);

        // ============================================================
        // STEP 12 — SUGGEST (FINAL)
        // ============================================================

        rich.addSuggest([
            'Test code block',
            'Test table',
            'Test image',
            'Test mix'
        ], { insertAt: 'post', id: 'suggest' });
        await rich.sendEdit();
        console.log('[TESTAIRICH] Step 12 OK');

        await ctx.react('✅');
        console.log('[TESTAIRICH] === Done ===');
    }
};
