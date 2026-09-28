// command/owner/setowner.js

import ownerManager from '../../lib/ownerManager.js';

export default {
    name: 'setowner',
    aliases: ['setown'],
    category: 'owner',
    description: '🔄 Replace all owners with new list',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply } = ctx;
        await ctx.react('⏳');

        if (!args || args.length === 0) {
            await ctx.react('❌');
            return (
                '❌ *Cara Penggunaan:*\n\n' +
                `.setowner <nomor1> <nomor2> ...\n\n` +
                '📌 *Contoh:*\n' +
                `.setowner 628123456789 628987654321\n\n` +
                `⚠️ *Peringatan:* Ini akan MENGHAPUS semua owner sebelumnya!`
            );
        }

        const result = ownerManager.setOwners(args);

        await ctx.react(result.success ? '✅' : '❌');
        return result.message;
    }
};