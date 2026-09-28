// command/owner/checkmenu.js
// 🔍 Cek command yang belum terdaftar di menu (dengan UI edit message)

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// MAP KATEGORI → MENU YANG SESUAI
// ============================================================

const CATEGORY_MENU_MAP = {
    'ai': 'aimenu',
    'converter': 'stickermenu',
    'downloader': 'downloadmenu',
    'group': 'groupmenu',
    'main': 'allmenu',
    'owner': 'ownermenu',
    'tools': 'toolsmenu',
    'vps': 'vpsmenu',
    'beta': 'allmenu (beta)'
};

// ============================================================
// AMBIL SEMUA COMMAND DARI FOLDER command/
// ============================================================

async function getAllCommands(dir = COMMAND_DIR) {
    const commands = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const sub = await getAllCommands(fullPath);
            commands.push(...sub);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            // Skip file menu
            if (['menu.js', 'allmenu.js', 'mainmenu.js', 'ownermenu.js', 
                 'stickermenu.js', 'downloadmenu.js', 'groupmenu.js', 
                 'toolsmenu.js', 'aimenu.js', 'vpsmenu.js'].includes(entry.name)) {
                continue;
            }
            try {
                const content = await fs.readFile(fullPath, 'utf8');
                const match = content.match(/name\s*:\s*['"]([^'"]+)['"]/);
                if (match) {
                    const relativePath = path.relative(COMMAND_DIR, fullPath);
                    const category = relativePath.split(path.sep)[0] || 'root';
                    commands.push({
                        name: match[1],
                        file: relativePath,
                        category: category,
                        fullPath: fullPath
                    });
                }
            } catch (e) {
                // Skip file yang error
            }
        }
    }

    return commands;
}

// ============================================================
// BACA COMMAND YANG TERDAFTAR DI MENU
// ============================================================

async function getRegisteredCommands() {
    const menuFiles = [
        'menu.js', 'allmenu.js', 'mainmenu.js',
        'ownermenu.js', 'vpsmenu.js', 'stickermenu.js',
        'downloadmenu.js', 'groupmenu.js', 'toolsmenu.js', 'aimenu.js'
    ];
    const registered = new Set();

    for (const menuFile of menuFiles) {
        try {
            const menuPath = path.join(COMMAND_DIR, 'main', menuFile);
            const content = await fs.readFile(menuPath, 'utf8');
            
            const matches = content.match(/\.([a-zA-Z0-9_]+)/g) || [];
            for (const m of matches) {
                const cmd = m.replace('.', '');
                // Filter kata-kata umum (bukan command)
                if (!['js', 'log', 'reply', 'sendMessage', 'react', 'text', 
                      'push', 'join', 'floor', 'format', 'emoji', 'getValue', 
                      'long', 'numeric', 'mode', 'User', 'pushName', 'restart', 
                      'cc', 'all', 'help', 'menu', 'p', 's'].includes(cmd)) {
                    registered.add(cmd);
                }
            }
        } catch (e) {
            // File tidak ditemukan, skip
        }
    }

    return registered;
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'checkmenu',
    aliases: ['cm', 'missing', 'cekmenu'],
    category: 'owner',
    description: '🔍 Cek command yang belum terdaftar di menu',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, sender, message, react } = ctx;
        await react('⏳');

        try {
            // Ambil semua command
            const allCommands = await getAllCommands();
            const registered = await getRegisteredCommands();

            // Cari yang belum terdaftar
            const missing = allCommands.filter(cmd => !registered.has(cmd.name));

            // ============================================================
            // BUILD OUTPUT BERTAHAP
            // ============================================================

            const botName = 'FarrMdV1';

            // Header
            const header = 
                `🔍 *CEK MENU COMMAND*\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📊 *Total Command:* ${allCommands.length}\n` +
                `📋 *Terdaftar di Menu:* ${registered.size}\n` +
                `⚠️ *Belum Terdaftar:* ${missing.length}\n\n`;

            // Kirim header (reply ke pesan user)
            const sent = await sock.sendMessage(chat, {
                text: header + `⏳ Memuat daftar...`,
                contextInfo: {
                    quotedMessage: message.message,
                    stanzaId: message.key.id,
                    participant: message.key.participant || message.key.remoteJid,
                    mentionedJid: [sender]
                }
            });

            await delay(1000);

            // ============================================================
            // TAMPILKAN PER KATEGORI (EDIT MESSAGE)
            // ============================================================

            let fullOutput = header;

            // Group by category
            const grouped = {};
            for (const cmd of missing) {
                const cat = cmd.category || 'unknown';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(cmd);
            }

            // Urutkan kategori
            const sortedCategories = Object.keys(grouped).sort();

            for (const category of sortedCategories) {
                const cmds = grouped[category];
                const menuName = CATEGORY_MENU_MAP[category] || `📂 ${category}/`;

                fullOutput += `\n📁 *Kategori: ${category}* (→ ${menuName})\n`;
                fullOutput += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;

                for (const cmd of cmds) {
                    const emoji = cmd.category === 'owner' ? '👑' :
                                  cmd.category === 'vps' ? '🖥️' :
                                  cmd.category === 'downloader' ? '📥' :
                                  cmd.category === 'converter' ? '🎬' :
                                  cmd.category === 'tools' ? '🛠️' :
                                  cmd.category === 'ai' ? '🤖' :
                                  cmd.category === 'group' ? '👥' :
                                  cmd.category === 'beta' ? '🧪' : '📄';
                    fullOutput += `  ${emoji} .${cmd.name} (${cmd.file})\n`;
                }

                // Edit message setiap kategori
                await sock.sendMessage(chat, {
                    text: fullOutput + `\n⏳ Memuat kategori berikutnya...`,
                    edit: sent.key
                });

                await delay(1000);
            }

            // ============================================================
            // FOOTER
            // ============================================================

            if (missing.length === 0) {
                fullOutput += `\n✅ *Semua command sudah terdaftar di menu!*`;
            } else {
                fullOutput += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                fullOutput += `💡 *Tambahkan ke menu yang sesuai:*\n`;
                fullOutput += `• command/main/allmenu.js\n`;
                fullOutput += `• command/main/[submenu].js\n\n`;
                fullOutput += `📝 *Contoh untuk kategori ${Object.keys(grouped).join(', ')}:*\n`;
                fullOutput += `Tambahkan ke menu yang sesuai di atas.`;
            }

            // Footer
            fullOutput += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
            fullOutput += `🤖 ${botName}\n`;
            fullOutput += `📅 ${new Date().toLocaleString('id-ID')}`;

            // Edit terakhir
            await sock.sendMessage(chat, {
                text: fullOutput,
                edit: sent.key
            });

            await react('✅');

        } catch (error) {
            console.error('[CHECKMENU] Error:', error.message);
            await react('❌');
            await sock.sendMessage(chat, {
                text: `❌ Gagal: ${error.message}`,
                contextInfo: {
                    quotedMessage: message.message,
                    stanzaId: message.key.id,
                    participant: message.key.participant || message.key.remoteJid
                }
            });
        }
    }
};
