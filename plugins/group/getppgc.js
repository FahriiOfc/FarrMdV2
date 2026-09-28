// command/group/getppgc.js

export default {
    name: 'getppgc',
    aliases: [],
    category: 'group',
    description: 'Get group profile picture (by link or current group)',
    groupOnly: false,

    async execute(ctx) {
        const { sock, chat, isGroup, text, args, isOwner } = ctx;

        let targetGroupJid = null;
        let linkInput = text || args.join(' ') || '';

        // Try to get link from arguments or quoted message
        if (!linkInput || !linkInput.includes('chat.whatsapp.com')) {
            const quoted = ctx.quoted;
            if (quoted?.text) {
                linkInput = quoted.text;
            }
        }

        // If link found, use it
        if (linkInput && linkInput.includes('chat.whatsapp.com')) {
            const match = linkInput.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
            if (match) {
                try {
                    const groupInfo = await sock.groupGetInviteInfo(match[1]);
                    targetGroupJid = groupInfo.id;
                } catch (error) {
                    await ctx.react('❌');
                    return `❌ Gagal mengambil info dari link: ${error.message}`;
                }
            } else {
                await ctx.react('❌');
                return '❌ Format link tidak valid.';
            }
        } else if (!targetGroupJid && isGroup) {
            // Use current group
            targetGroupJid = chat;
        } else if (!targetGroupJid && !isGroup) {
            // In PM, require link
            return (
                '❌ Tidak ada link grup!\n\n' +
                '📌 *Cara Penggunaan .getppgc:*\n' +
                '• Di Grup: `.getppgc` (ambil PP grup ini)\n' +
                '• Di PM: `.getppgc https://chat.whatsapp.com/xxxxxx`\n' +
                '• Di mana saja: `.getppgc https://chat.whatsapp.com/xxxxxx` (ambil PP grup lain)'
            );
        }

        if (!targetGroupJid) {
            await ctx.react('❌');
            return '❌ Gagal menentukan target grup.';
        }

        // Only owner can use link mode from PM
        if (!isGroup && !isOwner) {
            return '❌ Menggunakan link grup di PM hanya untuk Owner.';
        }

        await ctx.react('⏳');

        try {
            let ppUrl = null;
            try {
                ppUrl = await sock.profilePictureUrl(targetGroupJid, 'image');
            } catch (e) {
                ppUrl = null;
            }

            if (!ppUrl) {
                await ctx.react('❌');
                return 'ℹ️ Grup target tidak memiliki foto profil.';
            }

            await sock.sendMessage(chat, {
                image: { url: ppUrl },
                caption: '📸 PP Grup'
            });

            await ctx.react('✅');
            return; // Silent success

        } catch (error) {
            await ctx.react('❌');
            return `❌ Gagal mengambil PP: ${error.message}`;
        }
    }
};