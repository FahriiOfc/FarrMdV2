// command/owner/checkprem.js
// 🔍 Cek Status Premium

import premiumManager from '../../lib/premium.js';

export default {
    name: 'checkprem',
    aliases: ['cekprem', 'premstatus'],
    category: 'premium',
    description: '🔍 Cek status premium (sisa waktu)',
    premiumOnly: true,

    async execute(ctx) {
        const { sender, react, reply } = ctx;

        await react('⏳');

        const number = sender.replace(/\D/g, '');
        const info = premiumManager.getPremiumInfo(number);

        if (!info) {
            await react('❌');
            return '❌ Anda tidak memiliki akses premium.';
        }

        const remaining = info.expiresAt ? info.expiresAt - Date.now() : 0;
        const formatted = premiumManager.formatDuration(remaining);

        await react('✅');
        return (
            `🔍 *Premium Status*\n━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 Nomor: +${number}\n` +
            `⏱️ Sisa waktu: ${formatted}\n` +
            `📅 Berlaku hingga: ${new Date(info.expiresAt).toLocaleString('id-ID')}\n` +
            `👑 Ditambahkan oleh: +${info.addedBy}`
        );
    }
};