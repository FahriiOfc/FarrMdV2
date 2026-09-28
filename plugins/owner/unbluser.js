// command/owner/unbluser.js

import database from '../../lib/database.js';

export default {
    name: 'unbluser',
    aliases: ['unblacklistuser'],
    category: 'owner',
    description: 'Remove user from blacklist',
    ownerOnly: true,

    async execute(ctx) {
        let targetJid = ctx.resolveTarget();

        if (!targetJid) {
            const rawInput = ctx.args.join(' ').trim().replace(/^@/, '');
            const cleanNumber = rawInput.replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                targetJid = cleanNumber + '@s.whatsapp.net';
            }
        }

        if (!targetJid || !targetJid.endsWith('@s.whatsapp.net')) {
            return (
                '❌ Target tidak valid!\n\n' +
                '📌 Cara:\n' +
                '1. Reply pesan user: `.unbluser`\n' +
                '2. Tag user: `.unbluser @username`\n' +
                '3. Ketik nomor: `.unbluser 628123456789`'
            );
        }

        if (database.removeBlUser(targetJid)) {
            return `✅ User @${targetJid.split('@')[0]} berhasil dihapus dari blacklist.`;
        } else {
            return `ℹ️ User @${targetJid.split('@')[0]} tidak ada di blacklist.`;
        }
    }
};