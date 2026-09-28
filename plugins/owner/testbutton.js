// command/owner/testbutton.js

import config from '../../config.js';
import settings from '../../lib/settings.js';

export default {
    name: 'testbutton',
    aliases: ['testbtn', 'tbtn'],
    category: 'owner',
    description: 'Test all interactive message types',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, args, sender, isOwner } = ctx;

        if (!isOwner) {
            console.log(`[TESTBUTTON] Blocked non-owner: ${sender}`);
            return;
        }

        // Parse argumen: pilih jenis test
        const type = args[0]?.toLowerCase() || 'all';
        const jid = chat;

        await ctx.react('⏳');

        try {
            // ============================================================
            // 1. BUTTONS MESSAGE (Quick Reply Buttons)
            // ============================================================

            if (type === 'buttons' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: Buttons Message*\n\nPilih salah satu tombol di bawah:',
                    footer: 'Ini adalah footer buttons',
                    buttons: [
                        {
                            buttonId: 'btn_yes',
                            buttonText: { displayText: '✅ Ya' },
                            type: 1
                        },
                        {
                            buttonId: 'btn_no',
                            buttonText: { displayText: '❌ Tidak' },
                            type: 1
                        },
                        {
                            buttonId: 'btn_maybe',
                            buttonText: { displayText: '🤔 Mungkin' },
                            type: 1
                        }
                    ],
                    headerType: 1
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 2. BUTTONS WITH MEDIA HEADER
            // ============================================================

            if (type === 'buttons_media' || type === 'all') {
                await sock.sendMessage(jid, {
                    image: { url: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Buttons+With+Image' },
                    caption: '📌 *Test: Buttons with Media Header*\n\nTombol dengan gambar di atas:',
                    footer: 'Ini footer dengan media header',
                    buttons: [
                        {
                            buttonId: 'btn_media_1',
                            buttonText: { displayText: '👍 Like' },
                            type: 1
                        },
                        {
                            buttonId: 'btn_media_2',
                            buttonText: { displayText: '👎 Dislike' },
                            type: 1
                        }
                    ],
                    headerType: 1
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 3. LIST MESSAGE (Interactive List)
            // ============================================================

            if (type === 'list' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: List Message*\n\nPilih dari daftar di bawah:',
                    title: '📋 Menu Pilihan',
                    footer: 'Ini adalah footer list',
                    buttonText: '📋 Buka Daftar',
                    sections: [
                        {
                            title: '🍽️ Makanan',
                            rows: [
                                { title: '🍕 Pizza', rowId: 'list_pizza', description: 'Enak dan mengenyangkan' },
                                { title: '🍔 Burger', rowId: 'list_burger', description: 'Cepat saji favorit' },
                                { title: '🍣 Sushi', rowId: 'list_sushi', description: 'Makanan Jepang' }
                            ]
                        },
                        {
                            title: '🥤 Minuman',
                            rows: [
                                { title: '☕ Kopi', rowId: 'list_coffee', description: 'Hitam atau susu' },
                                { title: '🧋 Boba', rowId: 'list_boba', description: 'Manis dan segar' },
                                { title: '🥛 Susu', rowId: 'list_milk', description: 'Sehat dan bergizi' }
                            ]
                        }
                    ]
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 4. TEMPLATE BUTTONS
            // ============================================================

            if (type === 'template' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: Template Buttons*\n\nPilih aksi di bawah:',
                    footer: 'Ini footer template buttons',
                    templateButtons: [
                        { id: 'temp_verify', text: '✅ Verifikasi' },
                        { url: 'https://github.com/chaeulso/baileys', text: '🔗 Lihat Docs' },
                        { call: '+6281111111111', text: '📞 Hubungi' }
                    ]
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 5. NATIVE FLOW (Interactive Message)
            // ============================================================

            if (type === 'nativeflow' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: Native Flow (Interactive Message)*\n\nPilih aksi di bawah:',
                    footer: 'Ini footer native flow',
                    offerText: '🔥 Promo Spesial Hari Ini!',
                    optionText: '📋 Lihat Semua Opsi',
                    nativeFlow: [
                        { text: '✅ Setuju', id: 'flow_agree', icon: 'reply' },
                        { text: '📋 Copy Kode', copy: 'PROMO2024', icon: 'copy' },
                        { text: '🔗 Buka Link', url: 'https://github.com/chaeulso/baileys', icon: 'url' },
                        { text: '📞 Telepon', call: '+6281111111111', icon: 'call' },
                        { text: '📄 Detail', sections: [
                            { title: 'Pilih Detail', rows: [
                                { title: 'Detail A', id: 'flow_detail_a' },
                                { title: 'Detail B', id: 'flow_detail_b' }
                            ]}
                        ], icon: 'reply' }
                    ]
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 6. NATIVE FLOW WITH MEDIA
            // ============================================================

            if (type === 'nativeflow_media' || type === 'all') {
                await sock.sendMessage(jid, {
                    image: { url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Native+Flow' },
                    caption: '📌 *Test: Native Flow with Media*\n\nPilih aksi di bawah gambar:',
                    title: '🎯 Native Flow + Media',
                    nativeFlow: [
                        { text: '👍 Suka', id: 'flow_like', icon: 'reply' },
                        { text: '💾 Simpan', copy: 'SAVED', icon: 'copy' },
                        { text: '🔗 Detail', url: 'https://github.com/chaeulso/baileys', icon: 'url' }
                    ],
                    audioFooter: Buffer.from([]) // Placeholder jika ada audio
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 7. CAROUSEL (Cards)
            // ============================================================

            if (type === 'carousel' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: Carousel (Cards)*\n\nGeser untuk melihat produk:',
                    footer: 'Ini footer carousel',
                    cards: [
                        {
                            image: { url: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Card+1' },
                            title: '🛍️ Produk A',
                            subtitle: 'Rp 100.000',
                            caption: 'Deskripsi produk A yang menarik',
                            nativeFlow: [
                                { text: '🛒 Beli', id: 'card1_buy' },
                                { text: '🔍 Detail', url: 'https://github.com/chaeulso/baileys' }
                            ]
                        },
                        {
                            image: { url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Card+2' },
                            title: '🛍️ Produk B',
                            subtitle: 'Rp 200.000',
                            caption: 'Deskripsi produk B yang keren',
                            nativeFlow: [
                                { text: '🛒 Beli', id: 'card2_buy' },
                                { text: '🔍 Detail', url: 'https://github.com/chaeulso/baileys' }
                            ]
                        },
                        {
                            image: { url: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Card+3' },
                            title: '🛍️ Produk C',
                            subtitle: 'Rp 300.000',
                            caption: 'Deskripsi produk C yang premium',
                            nativeFlow: [
                                { text: '🛒 Beli', id: 'card3_buy' },
                                { text: '🔍 Detail', url: 'https://github.com/chaeulso/baileys' }
                            ]
                        }
                    ]
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 8. POLL MESSAGE
            // ============================================================

            if (type === 'poll' || type === 'all') {
                await sock.sendMessage(jid, {
                    poll: {
                        name: '📊 *Test: Poll Message*\n\nPilih jawaban favorit Anda:',
                        values: ['✅ Setuju', '❌ Tidak Setuju', '🤔 Netral'],
                        selectableCount: 1
                    }
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 9. QUIZ POLL (Newsletter only - tetap ditest)
            // ============================================================

            if (type === 'quiz' || type === 'all') {
                try {
                    await sock.sendMessage(jid, {
                        poll: {
                            name: '🧠 *Test: Quiz Poll*\n\nApa ibu kota Indonesia?',
                            values: ['Jakarta', 'Bandung', 'Surabaya'],
                            pollType: 1,
                            correctAnswer: 'Jakarta'
                        }
                    });
                } catch (e) {
                    console.log('[TESTBUTTON] Quiz hanya untuk newsletter');
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // 10. BUTTONS WITH NATIVE FLOW (Gabungan)
            // ============================================================

            if (type === 'hybrid' || type === 'all') {
                await sock.sendMessage(jid, {
                    text: '📌 *Test: Hybrid Buttons + Native Flow*\n\nGabungan dua jenis:',
                    footer: 'Footer hybrid',
                    buttons: [
                        {
                            buttonId: 'hybrid_quick',
                            buttonText: { displayText: '⚡ Quick Reply' },
                            type: 1
                        },
                        {
                            buttonId: 'hybrid_flow',
                            buttonText: { displayText: '📋 Native Flow' },
                            type: 1,
                            sections: [
                                { title: 'Pilih Opsi', rows: [
                                    { title: 'Opsi 1', id: 'hybrid_opt1' },
                                    { title: 'Opsi 2', id: 'hybrid_opt2' }
                                ]}
                            ]
                        }
                    ],
                    headerType: 1
                });
                await new Promise(r => setTimeout(r, 1000));
            }

            // ============================================================
            // SUMMARY
            // ============================================================

            await ctx.react('✅');
            
            let summary = `✅ *Semua Test Dikirim!*\n\n`;
            summary += `📌 *Tipe yang dikirim:*\n`;
            
            const types = {
                'buttons': 'Buttons Message',
                'buttons_media': 'Buttons + Media',
                'list': 'List Message',
                'template': 'Template Buttons',
                'nativeflow': 'Native Flow',
                'nativeflow_media': 'Native Flow + Media',
                'carousel': 'Carousel',
                'poll': 'Poll Message',
                'quiz': 'Quiz Poll',
                'hybrid': 'Hybrid Buttons'
            };

            if (type === 'all') {
                for (const [key, label] of Object.entries(types)) {
                    summary += `• ${label}\n`;
                }
            } else {
                summary += `• ${types[type] || type}\n`;
            }

            summary += `\n💡 *Cara Pakai:*\n`;
            summary += `.testbutton buttons\n`;
            summary += `.tbtn buttonsmedia\n`;
            summary += `.testbutton list\n`;
            summary += `.testbutton template\n`;
            summary += `.testbutton nativeflow\n`;
            summary += `.testbutton nativeflow_media`;
            summary += `.testbutton carousel\n`;
            summary += `.testbutton poll\n`;
            summary += `.testbutton quiz\n`;
            summary += `.testbutton hybrid\n`;
            summary += `.testbutton all (semua)`;

            return summary;

        } catch (error) {
            console.error('[TESTBUTTON] Error:', error.message);
            await ctx.react('❌');
            return `❌ Gagal mengirim test: ${error.message}`;
        }
    }
};