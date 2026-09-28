// command/ai/aichatmenu.js

import config from '../../config.js';
import settings from '../../lib/settings.js';

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

export default {
    name: 'aichatmenu',
    aliases: ['aimenu', 'aichtmenu'],
    category: 'ai',
    description: 'Show ai chat commands menu',
    async execute(ctx) {
        await ctx.react('⏳');
        const greeting = getTimeGreeting();
        const pushName = ctx.pushName || 'User';
        const modeText = settings.getValue('mode') === 'self' ? '🔐 Self Mode' : '🌐 Public Mode';

        const text =
            `${greeting.emoji} *${greeting.text}, ${pushName}!*\n\n` +
            '╭━━━〔 🤖 FARRMD V1 〕━━━╮\n' +
            '┃\n' +
            `┃ 👤 User : ${pushName}\n` +
            `┃ 🤖 Mode : ${modeText}\n` +
            `┃ 📅 ${formatDate()}\n` +
            `┃ ⏰ ${formatTime()} WIB\n` +
            `┃ ⏱️ ${formatRuntime(process.uptime())}\n` +
            '┃\n' +
            '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
            '╭━━━〔 🤖 AI CHAT MENU 〕━━━╮\n' +
            '┃\n' +
            '┃ 💬 .claude <pesan>\n' +
            '┃ 💬 .gpt5 <pesan>\n' +
            '┃ 💬 .unlimitedai [karakter] <pesan>\n' +
            '┃    └─ karakter: ourin, kobo, waguri, jokowi, prabowo\n' +
            '┃\n' +
            '╰━━━━━━━━━━━━━━━━━━━━╯\n\n' +
            '💡 Ketik .menu untuk menu utama';

        await ctx.reply(text);
        await ctx.react('✅');
    }
};