// command/owner/disablecmd.js
// 🔴 Nonaktifkan command

import commandManager from '../../lib/commandManager.js';

export default {
    name: 'disablecmd',
    aliases: ['disable', 'matikan'],
    category: 'owner',
    description: '🔴 Disable/Nonaktifkan command',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, commandLoader } = ctx;
        await ctx.react('⏳');

        if (!args || args.length === 0) {
            await ctx.react('❌');
            return (
                '🔴 *Disable Command*\n\n' +
                '❌ Masukkan nama command yang ingin dimatikan.\n\n' +
                '📌 *Contoh:*\n' +
                '.disablecmd sticker\n' +
                '.disablecmd tovideo\n' +
                '.disablecmd aimode\n\n' +
                '📋 Lihat command yang sedang mati: `.listdisabled`'
            );
        }

        const commandName = args[0].toLowerCase();

        // ============================================================
        // CEK APAKAH COMMAND ADA
        // ============================================================

        const cmd = commandLoader?.getCommand(commandName);
        if (!cmd) {
            await ctx.react('❌');
            return `❌ Command *${commandName}* tidak ditemukan.`;
        }

        // ============================================================
        // JANGAN BIARKAN MATIKAN COMMAND CORE
        // ============================================================

        const coreCommands = ['disablecmd', 'enablecmd', 'listdisabled', 'addcmd', 'delcmd', 'editcmd', 'getcmd'];
        if (coreCommands.includes(commandName)) {
            await ctx.react('❌');
            return `❌ Command *${commandName}* tidak boleh dimatikan (command core).`;
        }

        // ============================================================
        // MATIKAN COMMAND
        // ============================================================

        const result = commandManager.disableCommand(commandName);

        if (!result.success) {
            await ctx.react('❌');
            return result.message;
        }

        // ============================================================
        // RELOAD COMMAND
        // ============================================================

        try {
            await commandLoader?.scanCommands();
            console.log(`[DISABLECMD] Command ${commandName} disabled and reloaded`);
        } catch (error) {
            console.log('[DISABLECMD] Reload error:', error.message);
        }

        await ctx.react('🔴');
        return result.message;
    }
};