// command/vps/vpsmenu.js
// 🖥️ VPS Menu - Owner Only

import config from '../../config.js';
import os from 'os';

export default {
    name: 'vpsmenu',
    aliases: ['vps', 'servermenu'],
    category: 'vps',
    description: '🖥️ VPS Management Menu',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, react } = ctx;
        await react('⏳');

        const botName = config.botName || 'FarrMdV1';
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const runtimeStr = `${hours}h ${minutes}m`;

        const fakeQuotedMessage = {
            conversation:
                `🖥️ *VPS MANAGEMENT*\n` +
                `${botName} Server Control`
        };

        const fakeStanzaId = `vpsmenu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        const menuText = 
            `🖥️ *VPS MANAGEMENT MENU*\n\n` +
            `📊 *Server Info*\n` +
            `• Hostname: ${os.hostname()}\n` +
            `• Platform: ${os.platform()} ${os.release()}\n` +
            `• Bot Uptime: ${runtimeStr}\n` +
            `• CPU: ${os.cpus().length} Core\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📁 *FILE MANAGEMENT*\n` +
            `• .ls [path] - Lihat daftar file\n` +
            `• .tree [path] - Struktur folder\n` +
            `• .cat <file> - Lihat isi file\n` +
            `• .edit <file> - Edit file\n` +
            `• .mkdir <nama> - Buat folder\n` +
            `• .rm <file> - Hapus file\n` +
            `• .mv <src> <dst> - Pindahkan file\n` +
            `• .cp <src> <dst> - Copy file\n\n` +
            `🖥️ *SYSTEM MONITOR*\n` +
            `• .status - Info VPS (CPU/RAM/Disk)\n` +
            `• .df - Usage disk\n` +
            `• .free - RAM usage\n` +
            `• .uptime - Uptime VPS & bot\n` +
            `• .top - Proses berjalan\n` +
            `• .netstat - Koneksi jaringan\n\n` +
            `📦 *PACKAGE MANAGER*\n` +
            `• .apt install <pkg> - Install APT\n` +
            `• .apt remove <pkg> - Hapus APT\n` +
            `• .apt update - Update APT list\n` +
            `• .apt upgrade - Upgrade APT\n` +
            `• .npm install <pkg> - Install NPM\n` +
            `• .npm uninstall <pkg> - Hapus NPM\n` +
            `• .npm update - Update NPM\n\n` +
            `⚙️ *PM2 MANAGER*\n` +
            `• .pm2list - Daftar proses PM2\n` +
            `• .pm2logs [lines] - Log bot\n` +
            `• .pm2restart - Restart bot\n` +
            `• .pm2stop - Stop bot\n` +
            `• .pm2start - Start bot\n\n` +
            `⚡ *SHELL ACCESS*\n` +
            `• .exec <cmd> - Jalankan perintah\n\n` +
            `💾 *BACKUP*\n` +
            `• .backup - Backup seluruh project\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🛡️ Hanya Owner yang dapat mengakses menu ini.`;

        try {
            await sock.sendMessage(chat, {
                text: menuText,
                contextInfo: {
                    quotedMessage: fakeQuotedMessage,
                    stanzaId: fakeStanzaId,
                    participant: sock.user.id,
                    remoteJid: chat,
                    isForwarded: true,
                    forwardingScore: 999,
                    mentionedJid: [sender]
                },
                buttons: [
                    { 
                        buttonId: '.status', 
                        buttonText: { displayText: '📊 Status' }, 
                        type: 1 
                    },
                    { 
                        buttonId: '.uptime', 
                        buttonText: { displayText: '⏱️ Uptime' }, 
                        type: 1 
                    },
                    { 
                        buttonId: '.backup', 
                        buttonText: { displayText: '💾 Backup' }, 
                        type: 1 
                    }
                ],
                headerType: 1,
                footer: `🖥️ ${botName} VPS • ${new Date().toLocaleTimeString('id-ID')}`
            });

            await react('✅');
        } catch (error) {
            console.error('[VPSMENU] Error:', error.message);
            await react('❌');
            
            // Fallback text
            return (
                `🖥️ *VPS MENU*\n\n` +
                `📁 FILE: .ls, .tree, .cat, .edit, .mkdir, .rm, .mv, .cp\n` +
                `🖥️ MONITOR: .status, .df, .free, .uptime, .top, .netstat\n` +
                `📦 PACKAGE: .apt, .npm\n` +
                `⚙️ PM2: .pm2list, .pm2logs, .pm2restart, .pm2stop, .pm2start\n` +
                `⚡ SHELL: .exec\n` +
                `💾 BACKUP: .backup`
            );
        }
    }
};