// command/group/mute.js

import database from '../../lib/database.js';
import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'mute',
    aliases: [],
    category: 'group',
    description: 'Mute a user in group (delete all their messages)',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,

    async execute(ctx) {
        const { chat, sock, sender, message } = ctx;

        // ============================================================
        // GET TARGET
        // ============================================================

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
                '1. Reply pesan user: `.mute`\n' +
                '2. Tag user: `.mute @user`\n' +
                '3. Ketik nomor: `.mute 628123456789`'
            );
        }

        // Normalize
        target = normalizeJid(target);

        // ============================================================
        // CEK JANGAN MUTE BOT SENDIRI
        // ============================================================

        const botJid = sock?.user?.id || '';
        if (target === normalizeJid(botJid)) {
            await ctx.react('❌');
            return '❌ Tidak bisa mute bot sendiri.';
        }

        // ============================================================
        // CEK JANGAN MUTE OWNER
        // ============================================================

        const isTargetOwner = await ctx.identity?.isOwner(target, sock) || false;
        if (isTargetOwner) {
            await ctx.react('❌');
            return '❌ Tidak bisa mute Owner bot.';
        }

        // ============================================================
        // CEK JANGAN MUTE ADMIN LAIN
        // ============================================================

        const isTargetAdmin = ctx.identity?.isAdmin(ctx.metadata, target) || false;
        if (isTargetAdmin && !ctx.isOwner) {
            await ctx.react('❌');
            return `❌ Tidak bisa mute admin lain.`;
        }

        // ============================================================
        // MUTE USER
        // ============================================================

        if (database.addMute(chat, target)) {
            // ✅ REACT KE OWNER (centang)
            await ctx.react('✅');
            
            // 🔇 REACT KE TARGET (speaker mute) - ke pesan yang di-reply atau ke chat
            try {
                // Jika ada pesan yang di-reply, react ke situ
                if (ctx.quoted?.key) {
                    await sock.sendMessage(chat, {
                        react: { text: '🔇', key: ctx.quoted.key }
                    });
                } else {
                    // Kirim pesan sistem ke grup
                    await sock.sendMessage(chat, {
                        text: `🔇 @${target.split('@')[0]} telah dimute oleh @${sender.split('@')[0]}`,
                        mentions: [target, sender]
                    });
                }
            } catch (reactError) {
                console.log('[MUTE] React error:', reactError.message);
            }
            
            return `🔇 @${target.split('@')[0]} telah dimute.\n\nSemua pesan dari user ini akan otomatis dihapus.`;
        } else {
            await ctx.react('ℹ️');
            return `ℹ️ @${target.split('@')[0]} *sudah* dimute.`;
        }
    }
};