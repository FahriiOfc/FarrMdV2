// command/owner/getpp.js

export default {
    name: 'getpp',
    aliases: [],
    category: 'owner',
    description: 'Get user profile picture',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, message, isGroup, args } = ctx;

        let target = ctx.resolveTarget();

        if (!target) {
            const argNumber = args[0] || '';
            if (argNumber) {
                const cleanNumber = argNumber.replace(/\D/g, '');
                if (cleanNumber.length >= 10) {
                    target = cleanNumber + '@s.whatsapp.net';
                }
            }
        }

        if (!target && isGroup) {
            return (
                '❌ Target tidak ditemukan!\n\n' +
                '📌 *Cara Penggunaan di Grup:*\n' +
                '1. Tag user: `.getpp @username`\n' +
                '2. Reply pesan user: `.getpp` (reply ke chat orang tersebut)\n' +
                '3. Ketik nomor: `.getpp 628123456789`'
            );
        }

        if (!target && !isGroup) {
            return (
                '❌ Target tidak ditemukan!\n\n' +
                '📌 *Cara Penggunaan di Chat Pribadi:*\n' +
                '1. Reply pesan teman Anda: `.getpp` (reply ke chat orang tersebut)\n' +
                '2. Ketik nomor teman Anda: `.getpp 628123456789`'
            );
        }

        if (!target) {
            return '❌ Target tidak valid.';
        }

        await ctx.react('⏳');

        try {
            let ppUrl = null;
            try {
                ppUrl = await sock.profilePictureUrl(target, 'image');
            } catch (e) {
                ppUrl = null;
            }

            if (!ppUrl) {
                await ctx.react('❌');
                return `ℹ️ @${target.split('@')[0]} tidak memiliki foto profil.`;
            }

            await sock.sendMessage(chat, {
                image: { url: ppUrl },
                caption: `📸 *Foto Profil*\n\n👤 @${target.split('@')[0]}`
            });

            await ctx.react('✅');
            return; // Silent success

        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal mengambil foto profil: ${error.message}`;
        }
    }
};