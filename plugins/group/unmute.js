// command/group/unmute.js

import database from '../../lib/database.js';
import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'unmute',
    aliases: [],
    category: 'group',
    description: 'Unmute a user in group',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { chat, sock } = ctx;

        let target = ctx.resolveTarget();

        if (!target) {
            const rawInput = ctx.args.join(' ').trim().replace(/^@/, '');
            const cleanNumber = rawInput.replace(/\D/g, '');
            if (cleanNumber.length >= 10) {
                target = cleanNumber + '@s.whatsapp.net';
            }
        }

        if (!target) {
            await ctx.react('❌');
            return (
                '❌ Target tidak valid!\n\n' +
                '📌 Cara:\n' +
                '1. Reply pesan user: `.unmute`\n' +
                '2. Tag user: `.unmute @user`\n' +
                '3. Ketik nomor: `.unmute 628123456789`'
            );
        }

        target = normalizeJid(target);

        if (database.removeMute(chat, target)) {
            await ctx.react('✅');
            
            // 🔊 React ke target
            try {
                if (ctx.quoted?.key) {
                    await sock.sendMessage(chat, {
                        react: { text: '🔊', key: ctx.quoted.key }
                    });
                }
            } catch (e) {}
            
            return `🔊 @${target.split('@')[0]} telah diunmute.`;
        } else {
            await ctx.react('ℹ️');
            return `ℹ️ @${target.split('@')[0]} *tidak* dalam daftar mute.`;
        }
    }
};