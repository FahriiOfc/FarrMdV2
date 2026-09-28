// command/owner/listdisabled.js
// 📋 Lihat daftar command yang mati

import commandManager from '../../lib/commandManager.js';

export default {
    name: 'listdisabled',
    aliases: ['listmati', 'ld'],
    category: 'owner',
    description: '📋 List disabled commands',
    ownerOnly: true,

    async execute(ctx) {
        const { reply } = ctx;
        await ctx.react('⏳');

        const disabled = commandManager.getDisabledList();

        if (!disabled || disabled.length === 0) {
            await ctx.react('✅');
            return '📋 *Daftar Command Mati*\n\n✅ Tidak ada command yang sedang dimatikan.';
        }

        const list = disabled.map((name, i) => `${i + 1}. \`${name}\``).join('\n');

        await ctx.react('📋');
        return (
            `📋 *Daftar Command Mati*\n\n` +
            `${list}\n\n` +
            `📊 *Total: ${disabled.length} command mati*\n\n` +
            `🟢 Aktifkan: .enablecmd <nama>`
        );
    }
};