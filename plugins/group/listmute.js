// command/group/listmute.js

import database from '../../lib/database.js';
import { normalizeJid } from '../../lib/identity.js';

export default {
    name: 'listmute',
    aliases: ['mutelist'],
    category: 'group',
    description: 'List muted users in group',
    groupOnly: true,
    adminOnly: true,
    botAdmin: false,

    async execute(ctx) {
        const { chat } = ctx;

        await ctx.react('⏳');

        const users = database.getMutedUsers(chat);

        if (!users || users.length === 0) {
            await ctx.react('📋');
            return '📋 Tidak ada member yang sedang dimute.';
        }

        const list = users.map((user, index) => {
            const jid = normalizeJid(user);
            return `${index + 1}. @${jid.split('@')[0]}`;
        }).join('\n');

        await ctx.react('✅');
        return `🔇 *DAFTAR MEMBER MUTE*\n\n${list}`;
    }
};