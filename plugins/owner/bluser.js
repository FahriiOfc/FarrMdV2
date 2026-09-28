// command/owner/bluser.js

import database from '../../lib/database.js';

export default {
    name: 'bluser',
    aliases: ['blacklistuser'],
    category: 'owner',
    description: 'Blacklist a user',
    ownerOnly: true,

    async execute(ctx) {
        await ctx.react('⏳');

        let targetJid = ctx.resolveTarget();

        if (!targetJid) {
            const rawInput = ctx.args.join(' ').trim().replace(/^@/, '');
            const cleanNumber = rawInput.replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                targetJid = cleanNumber + '@s.whatsapp.net';
            }
        }

        if (!targetJid || !targetJid.endsWith('@s.whatsapp.net')) {
            await ctx.react('❌');
            return (
                '❌ Target tidak valid!\n\n' +
                '📌 Cara:\n' +
                '1. Reply pesan user: `.bluser`\n' +
                '2. Tag user: `.bluser @username`\n' +
                '3. Ketik nomor: `.bluser 628123456789`'
            );
        }

        const botJid = ctx.sock?.user?.id || '';
        if (targetJid === botJid) {
            await ctx.react('❌');
            return '❌ Tidak bisa memblacklist bot sendiri.';
        }

        const config = await import('../../config.js').then(m => m.default);
        if (targetJid.includes(config.ownerNumber)) {
            await ctx.react('❌');
            return '❌ Tidak bisa memblacklist Owner.';
        }

        if (database.addBlUser(targetJid)) {
            await ctx.react('✅');
            return `⛔ User @${targetJid.split('@')[0]} berhasil diblacklist.`;
        } else {
            await ctx.react('ℹ️');
            return `ℹ️ User @${targetJid.split('@')[0]} sudah ada di blacklist.`;
        }
    }
};