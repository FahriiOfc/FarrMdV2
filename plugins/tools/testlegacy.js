// plugins/tools/testlegacy.js
// 🧪 Test menu legacy buttonsMessage (persis seperti screenshot)

import os from 'os';
import fs from 'fs';

export default {
    name: 'testlegacy',
    aliases: ['tlegacy'],
    category: 'tools',
    description: '🧪 Test legacy buttonsMessage',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, react } = ctx;

        await react('⏳');

        const now = new Date();
        const dateInfo =
            now.toLocaleDateString('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) +
            ' • ' +
            now.toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) +
            ' WIB';

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const number = sender.split('@')[0];

        const menuText = `╭┈〔 𝘽𝙊𝙏 〕
┊ ◈ 𝙉𝙖𝙢𝙚 › FarrMdV2
┊ ◈ 𝘿𝙚𝙫 › FarrDev
┊ ◈ 𝙏𝙮𝙥𝙚 › ESM
┊ ◈ 𝙈𝙤𝙙𝙚 › Public
┊ ◈ 𝙉𝙪𝙢𝙗𝙚𝙧 › ${number}
┊ ◈ 𝘼𝙠𝙨𝙚𝙨 𝙍𝙤𝙡𝙚 › Owner
╰┈┈┈┈┈┈┈┈

╭┈〔 𝙎𝙔𝙎𝙏𝙀𝙈 〕
┊ ◇ 𝙍𝙚𝙨𝙥𝙤𝙣𝙨𝙚 › 0${Math.floor(Math.random() * 999)} ms
┊ ◇ 𝙍𝙪𝙣𝙩𝙞𝙢𝙚 › ${days}d ${hours}h ${minutes}m ${seconds}s
╰┈┈┈┈┈┈┈┈`;

        // Ambil image thumbnail
        let imageBuffer = null;
        try {
            const thumbPath = './thumb/thumb.jpg';
            if (fs.existsSync(thumbPath)) {
                imageBuffer = fs.readFileSync(thumbPath);
            }
        } catch (e) {
            console.log('[TESTLEGACY] No thumb file:', e.message);
        }

        await sock.sendMessage(chat, {
            buttonsMessage: {
                locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: 'FarrMdV2',
                    address: dateInfo,
                    jpegThumbnail: imageBuffer
                },
                contentText: menuText,
                footerText: '© FarrDev',
                buttons: [
                    {
                        buttonId: 'legacy_list',
                        buttonText: {
                            displayText: '📋 LIST'
                        },
                        type: 1,
                        nativeFlowInfo: {
                            name: 'single_select',
                            paramsJson: JSON.stringify({
                                title: 'Pilih Menu',
                                sections: [
                                    {
                                        title: 'Main Menu',
                                        highlight_label: 'FarrMdV2',
                                        rows: [
                                            {
                                                header: '',
                                                title: 'Owner Menu',
                                                description: 'Menu khusus owner',
                                                id: 'ownermenu',
                                                highlight_label: 'NEW'
                                            },
                                            {
                                                header: '',
                                                title: 'All Menu',
                                                description: 'Semua fitur',
                                                id: 'allmenu',
                                                highlight_label: 'POPULAR'
                                            },
                                            {
                                                header: '',
                                                title: 'Downloader',
                                                description: 'Yt, Tiktok, IG, FB',
                                                id: 'downloadmenu'
                                            },
                                            {
                                                header: '',
                                                title: 'Sticker Menu',
                                                description: 'Converter & sticker',
                                                id: 'stickermenu'
                                            }
                                        ]
                                    }
                                ]
                            })
                        }
                    },
                    {
                        buttonId: 'ownermenu',
                        buttonText: {
                            displayText: '👤 OWNER'
                        },
                        type: 1
                    }
                ],
                headerType: 6
            }
        });

        await react('✅');
    }
};