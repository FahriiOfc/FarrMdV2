// command/owner/listbluser.js

import database from '../../lib/database.js';

export default {
    name: 'listbluser',
    aliases: ['listblacklistuser'],
    category: 'owner',
    description: 'List blacklisted users',
    ownerOnly: true,

    execute(ctx) {
        const db = database.getBlUser();
        if (!db.users.length) {
            return '📋 Belum ada user yang diblacklist.';
        }

        const list = db.users.map((u, i) => `${i + 1}. ${u}`).join('\n');
        return `📋 *Daftar Blacklist User (${db.users.length})*\n\n${list}`;
    }
};