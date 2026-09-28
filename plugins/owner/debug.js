// command/owner/debug.js

export default {
    name: 'debug',
    aliases: ['dbg'],
    category: 'owner',
    description: 'Debug identity info',
    ownerOnly: true,

    async execute(ctx) {
        const { sender, isOwner, isBot, fromMe, sock } = ctx;
        const botJid = sock?.user?.id || '';

        const info = 
            `🛠️ *DEBUG IDENTITY*\n\n` +
            `📱 Sender: ${sender}\n` +
            `🤖 Bot JID: ${botJid}\n` +
            `👑 isOwner: ${isOwner ? '✅ TRUE' : '❌ FALSE'}\n` +
            `🤖 isBot: ${isBot ? '✅ TRUE' : '❌ FALSE'}\n` +
            `📤 fromMe: ${fromMe ? '✅ TRUE' : '❌ FALSE'}\n` +
            `📋 Mode: ${fromMe ? 'Bot sendiri' : 'User lain'}`;

        await ctx.reply(info);
        await ctx.react('✅');
    }
};