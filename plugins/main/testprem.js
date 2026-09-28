// command/premium/testprem.js
// 🧪 TEST PREMIUM - Contoh command premiumOnly

export default {
    name: 'testprem',
    aliases: ['tp'],
    category: 'premium',
    description: '🧪 Test command premium (contoh)',
    premiumOnly: true,

    async execute(ctx) {
        const { react, reply, sender } = ctx;

        await react('⏳');

        const number = sender.replace(/\D/g, '');

        await react('✅');
        return (
            `🧪 *Test Premium Berhasil!*\n\n` +
            `👤 Anda adalah user premium!\n` +
            `📱 Nomor: +${number}\n\n` +
            `✅ Command ini hanya bisa diakses oleh user premium.`
        );
    }
};