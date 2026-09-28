// plugins/beta/pay.js
// 💳 Payment Request via WA Business
// Format: .pay <wallet> <nominal> [keterangan]

import config from '../../config.js';

// ============================================================
// KONFIGURASI PAYMENT
// ============================================================

const PAYMENT_ACCOUNTS = {
    // ─── E-Wallet ───
    gopay: {
        label: 'GoPay',
        account_type: 'digital_wallet',
        identifier_type: 'phone_number',
        identifier_value: '085893028915',
        institution_name: 'GoPay',
        beneficiary_name: 'M Fahri A'
    },
    dana: {
        label: 'DANA',
        account_type: 'digital_wallet',
        identifier_type: 'phone_number',
        identifier_value: '085893028915',
        institution_name: 'DANA',
        beneficiary_name: 'M Fahri A'
    },
    ovo: {
        label: 'OVO',
        account_type: 'digital_wallet',
        identifier_type: 'phone_number',
        identifier_value: '085893028915',
        institution_name: 'OVO',
        beneficiary_name: 'M Fahri A'
    },
    shopeepay: {
        label: 'ShopeePay',
        account_type: 'digital_wallet',
        identifier_type: 'phone_number',
        identifier_value: '085893028915',
        institution_name: 'ShopeePay',
        beneficiary_name: 'M Fahri A'
    },

    // ─── Bank ───
    bca: {
        label: 'BCA',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'Bank Central Asia',
        beneficiary_name: 'M Fahri A'
    },
    mandiri: {
        label: 'Mandiri',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'Bank Mandiri',
        beneficiary_name: 'M Fahri A'
    },
    bni: {
        label: 'BNI',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'Bank Negara Indonesia',
        beneficiary_name: 'M Fahri A'
    },
    bri: {
        label: 'BRI',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'Bank Rakyat Indonesia',
        beneficiary_name: 'M Fahri A'
    },
    jago: {
        label: 'Bank Jago',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'Bank Jago',
        beneficiary_name: 'M Fahri A'
    },
    seabank: {
        label: 'SeaBank',
        account_type: 'bank_account',
        identifier_type: 'id_account_number',
        identifier_value: '1234567890',
        institution_name: 'SeaBank',
        beneficiary_name: 'M Fahri A'
    }
};

// ============================================================
// HELPER — Format Rupiah
// ============================================================

function formatRupiah(number) {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'pay',
    aliases: ['payment', 'invoice', 'bayar'],
    category: 'owner',
    description: '💳 Kirim payment request via WA Business',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, args, react, message, pushName } = ctx;

        await react('⏳');

        const walletKey = (args[0] || '').toLowerCase();
        const amount = parseInt(args[1]) || 0;
        const description = args.slice(2).join(' ') || 'Pembayaran';

        // ------------------------------------------------------------
        // HELP / LIST
        // ------------------------------------------------------------

        if (!walletKey || walletKey === 'list' || walletKey === 'help') {
            let text = `💳 *PAYMENT REQUEST*\n\n`;
            text += `*Format:*\n`;
            text += `\`.pay <wallet> <nominal> [keterangan]\`\n\n`;
            text += `*Wallet tersedia:*\n`;

            for (const [k, v] of Object.entries(PAYMENT_ACCOUNTS)) {
                text += `> • \`${k}\` — ${v.label}\n`;
            }

            text += `\n*Contoh:*\n`;
            text += `• \`.pay gopay 50000 Premium 1 bulan\`\n`;
            text += `• \`.pay bca 150000 Order #12345\`\n`;
            text += `• \`.pay dana 999999 Pembayaran Besar\``;

            await react('✅');
            return text;
        }

        // ------------------------------------------------------------
        // VALIDASI WALLET
        // ------------------------------------------------------------

        const account = PAYMENT_ACCOUNTS[walletKey];

        if (!account) {
            await react('❌');
            return (
                `❌ Wallet *${walletKey}* tidak didukung.\n\n` +
                `Ketik \`.pay list\` untuk daftar wallet.`
            );
        }

        // ------------------------------------------------------------
        // VALIDASI NOMINAL
        // ------------------------------------------------------------

        if (!amount || amount < 1) {
            await react('❌');
            return (
                `❌ Nominal tidak valid.\n\n` +
                `Format: \`.pay ${walletKey} <nominal> [keterangan]\`\n` +
                `Contoh: \`.pay ${walletKey} 50000 Pembayaran\``
            );
        }

        // ------------------------------------------------------------
        // BUILD PAYMENT REQUEST
        // ------------------------------------------------------------

        try {
            const { generateWAMessageFromContent, proto } = await import('@chaeulso/baileys');

            // ✅ RUMUS BENAR: value = amount × 100 (offset 100 = 2 desimal)
            const value = amount * 10;
            const offset = 10;

            const buttonParams = {
                currency: 'IDR',
                payment_type: 'upr',
                total_amount: {
                    value: value,
                    offset: offset
                },
                reference_id: `FARR-${Date.now()}`,
                type: 'digital-goods',
                order: {
                    status: 'pending',
                    order_type: 'PAYMENT_REQUEST'
                },
                payment_settings: [{
                    type: 'payment_account',
                    payment_account: {
                        account_type: account.account_type,
                        identifier_type: account.identifier_type,
                        identifier_value: account.identifier_value,
                        institution_name: account.institution_name,
                        beneficiary_name: account.beneficiary_name
                    }
                }],
                share_payment_status: false,
                is_soft_deleted: false
            };

            const buttons = [{
                name: 'review_and_pay',
                buttonParamsJson: JSON.stringify(buttonParams)
            }];

            const bodyText =
                `💳 *INVOICE PEMBAYARAN*\n\n` +
                `👤 Untuk : ${pushName || 'Customer'}\n` +
                `💼 Metode : ${account.label}\n` +
                `💰 Total : *${formatRupiah(amount)}*\n` +
                `📝 Ket : ${description}\n\n` +
                `👇 Klik tombol di bawah untuk bayar`;

            const footerText = `${config.botName || 'FarrMdV2'} • Payment Request`;

            const msg = generateWAMessageFromContent(
                chat,
                proto.Message.fromObject({
                    interactiveMessage: {
                        body: { text: bodyText },
                        footer: { text: footerText },
                        nativeFlowMessage: { buttons }
                    }
                }),
                { userJid: sender, quoted: message }
            );

            await sock.relayMessage(chat, msg.message, { messageId: msg.key.id });

            await react('✅');
            console.log(`[PAY] ${walletKey} | ${amount} | ${description} | value=${value}`);

        } catch (error) {
            console.error('[PAY] Error:', error.message);
            await react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};