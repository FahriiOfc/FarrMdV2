// plugins/main/menu.js
// Menu dengan style dinamis (listimg / listgif)

import config from '../../config.js';
import settings from '../../lib/settings.js';
import { Button } from '../../lib/MessageBuilder.js';

// ============================================================
// HELPERS
// ============================================================

function getTimeGreeting() {
    const hour = Number(
        new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            hour12: false
        }).format(new Date())
    );
    if (hour >= 4 && hour < 11) return { emoji: '🌅', text: 'Selamat pagi' };
    if (hour >= 11 && hour < 15) return { emoji: '☀️', text: 'Selamat siang' };
    if (hour >= 15 && hour < 18) return { emoji: '🌇', text: 'Selamat sore' };
    return { emoji: '🌙', text: 'Selamat malam' };
}

function formatDate() {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
}

function formatTime() {
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date());
}

function formatRuntime(seconds) {
    seconds = Math.floor(Number(seconds) || 0);
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const result = [];
    if (days) result.push(`${days}d`);
    if (hours) result.push(`${hours}h`);
    if (minutes) result.push(`${minutes}m`);
    result.push(`${seconds}s`);
    return result.join(', ');
}

// ============================================================
// MENU DATA
// ============================================================

const MENU_ROWS = [
    { title: '📋 Menu Utama', description: 'Command utama bot', id: 'mainmenu' },
    { title: '📋 Semua Menu', description: 'Lihat semua command', id: 'allmenu' },
    { title: '👑 Owner Menu', description: 'Command khusus owner', id: 'ownermenu' },
    { title: '📥 Downloader Menu', description: 'YT, TikTok, IG, FB, GitHub', id: 'downloadmenu' },
    { title: '🖼️ Sticker Menu', description: 'Sticker & Converter', id: 'stickermenu' },
    { title: '👥 Group Menu', description: 'Command grup', id: 'groupmenu' },
    { title: '🛠️ Image & Tools Menu', description: 'Brat, SSWeb & lainnya', id: 'toolsmenu' },
    { title: '🤖 AI CHAT MENU', description: 'claude, gpt5 & lainnya', id: 'aimenu' }
];

const HEADER_IMG = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/gambar.jpg';
const HEADER_VID = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/video.mp4';
const HEADER_VID2 = 'https://raw.githubusercontent.com/FahriiOfc/thumb/main/video2.mp4';

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'menu',
    aliases: ['help', '?'],
    category: 'main',
    description: 'Show main menu',

    async execute(ctx) {
        const { sock, chat, pushName } = ctx;

        await ctx.react('⏳');

        const greeting = getTimeGreeting();
        const modeText = settings.getValue('mode') === 'self' ? '🔐 Self Mode' : '🌐 Public Mode';
        const style = settings.getValue('menuStyle') || 'listimg';

        console.log('[MENU] Style:', style);

        const headerText =
            `${greeting.emoji} *${greeting.text}, ${pushName || 'User'}!*\n\n` +
            `👤 User : ${pushName || 'User'}\n` +
            `🤖 Mode : ${modeText}\n` +
            `📅 ${formatDate()}\n` +
            `⏰ ${formatTime()} WIB\n` +
            `⏱️ ${formatRuntime(process.uptime())}\n\n` +
            `📋 *Pilih Menu di Bawah:*`;

        // ============================================================
        // RENDER SESUAI STYLE
        // ============================================================

        try {
            const btn = new Button(sock);
            btn.setTitle('🤖 FARRMD V2 MENU');
            btn.setBody(headerText);
            btn.setFooter('📱 FarrMdV2 - Pilih menu');

            if (style === 'listimg') {
                // List + Image
                btn.setImage(HEADER_IMG);
            } else if (style === 'listgif') {
                // List + Video GIF
                btn.setMedia({
                    video: { url: HEADER_VID2 },
                    gifPlayback: true
                });
            }

            // Tambah list selection
            btn.addSelection('📖 Silahkan Pilih Menu', {
                sections: [
                    {
                        title: '📖 Daftar Menu',
                        rows: MENU_ROWS
                    }
                ]
            });

            await btn.send(chat);
            await ctx.react('✅');

        } catch (error) {
            console.log('[MENU] Error:', error.message);
            await ctx.react('❌');

            // Fallback ke text
            const fallbackText =
                `${headerText}\n\n` +
                '╭━━━〔 📖 SILAHKAN PILIH 〕━━━╮\n' +
                '┃\n' +
                MENU_ROWS.map((r, i) => `┃ ${i + 1}️⃣ .${r.id} - ${r.title.replace(/^[^\s]+\s/, '')}`).join('\n') +
                '\n┃\n' +
                '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
                '💡 Ketik salah satu command di atas';

            await ctx.reply(fallbackText);
        }
    }
};