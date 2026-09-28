// command/owner/enablecmd.js
// 🟢 Aktifkan command

import commandManager from '../../lib/commandManager.js';

export default {
    name: 'enablecmd',
    aliases: ['enable', 'nyalakan'],
    category: 'owner',
    description: '🟢 Enable/Aktifkan command kembali',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, commandLoader } = ctx;
        await ctx.react('⏳');

        if (!args || args.length === 0) {
            await ctx.react('❌');
            return (
                '🟢 *Enable Command*\n\n' +
                '❌ Masukkan nama command yang ingin dinyalakan.\n\n' +
                '📌 *Contoh:*\n' +
                '.enablecmd sticker\n' +
                '.enablecmd tovideo\n' +
                '.enablecmd aimode\n\n' +
                '📋 Lihat command yang sedang mati: `.listdisabled`'
            );
        }

        const commandName = args[0].toLowerCase();

        // ============================================================
        // CEK APAKAH COMMAND ADA DI DAFTAR MATI
        // ============================================================

        const isDisabled = commandManager.isDisabled(commandName);
        if (!isDisabled) {
            await ctx.react('❌');
            return `❌ Command *${commandName}* tidak dalam keadaan mati.`;
        }

        // ============================================================
        // NYALAKAN COMMAND
        // ============================================================

        const result = commandManager.enableCommand(commandName);

        if (!result.success) {
            await ctx.react('❌');
            return result.message;
        }

        // ============================================================
        // RELOAD COMMAND
        // ============================================================

        try {
            await commandLoader?.scanCommands();
            console.log(`[ENABLECMD] Command ${commandName} enabled and reloaded`);
        } catch (error) {
            console.log('[ENABLECMD] Reload error:', error.message);
        }

        await ctx.react('🟢');
        return result.message;
    }
};