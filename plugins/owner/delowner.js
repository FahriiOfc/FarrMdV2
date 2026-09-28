// command/owner/delowner.js

import ownerManager from '../../lib/ownerManager.js';

export default {
    name: 'delowner',
    aliases: ['delown', 'removeowner'],
    category: 'owner',
    description: '❌ Remove owner number',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply } = ctx;
        await ctx.react('⏳');

        if (!args || args.length === 0) {
            await ctx.react('❌');
            return (
                '❌ *Cara Penggunaan:*\n\n' +
                `.delowner <nomor>\n\n` +
                '📌 *Contoh:*\n' +
                `.delowner 628123456789`
            );
        }

        const rawNumber = args[0];
        const result = ownerManager.removeOwner(rawNumber);

        await ctx.react(result.success ? '✅' : '❌');
        return result.message;
    }
};