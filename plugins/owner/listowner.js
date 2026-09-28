// command/owner/listowner.js

import ownerManager from '../../lib/ownerManager.js';

export default {
    name: 'listowner',
    aliases: ['listown', 'owners'],
    category: 'owner',
    description: '📋 List all owners',
    ownerOnly: true,

    async execute(ctx) {
        const { reply } = ctx;
        await ctx.react('⏳');

        const owners = ownerManager.getOwners();

        if (!owners || owners.length === 0) {
            await ctx.react('❌');
            return '📋 *Daftar Owner*\n\nTidak ada owner terdaftar.';
        }

        const list = owners.map((num, i) => `${i + 1}. +${num}`).join('\n');

        await ctx.react('✅');
        return (
            `👑 *Daftar Owner*\n\n` +
            `${list}\n\n` +
            `📊 *Total: ${owners.length} owner${owners.length > 1 ? 's' : ''}*`
        );
    }
};