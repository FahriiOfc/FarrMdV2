// command/owner/modeprefix.js
// 🔧 Mode Prefix - Toggle prefix requirement

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../database', 'modeprefix.json');

// ============================================================
// DATABASE FUNCTIONS
// ============================================================

function getSettings() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch {
        const defaultSettings = { enabled: true };
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
    }
}

function saveSettings(data) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'modeprefix',
    aliases: ['mp', 'prefixmode', 'prefix'],
    category: 'owner',
    description: '🔧 Toggle prefix mode (on/off)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, reply, react } = ctx;
        await react('⏳');

        const settings = getSettings();

        // ============================================================
        // TANPA ARGUMEN → TAMPILKAN STATUS
        // ============================================================

        if (!args || args.length === 0) {
            await react('✅');
            return (
                `🔧 *Mode Prefix*\n\n` +
                `Status: ${settings.enabled ? '✅ ON (pakai prefix)' : '❌ OFF (tanpa prefix)'}\n\n` +
                `📌 *Perintah:*\n` +
                `.modeprefix on  - Aktifkan (harus pakai prefix)\n` +
                `.modeprefix off - Nonaktifkan (bisa tanpa prefix)\n\n` +
                `📌 *Alias:*\n` +
                `.mp on/off\n` +
                `.prefixmode on/off\n` +
                `.prefix on/off`
            );
        }

        // ============================================================
        // ON / OFF
        // ============================================================

        const action = args[0].toLowerCase();

        if (action === 'on' || action === '1' || action === 'true') {
            settings.enabled = true;
            saveSettings(settings);
            await react('✅');
            return (
                `🔧 *Mode Prefix diaktifkan!*\n\n` +
                `Sekarang command *harus* pakai prefix.\n` +
                `📌 Contoh: \`.ping\`, \`.owner\`, \`.menu\``
            );
        }

        if (action === 'off' || action === '0' || action === 'false') {
            settings.enabled = false;
            saveSettings(settings);
            await react('✅');
            return (
                `🔧 *Mode Prefix dinonaktifkan!*\n\n` +
                `Sekarang command bisa dipanggil *tanpa prefix*.\n` +
                `📌 Contoh: \`ping\`, \`owner\`, \`menu\``
            );
        }

        // ============================================================
        // INVALID
        // ============================================================

        await react('❌');
        return '❌ Gunakan `.modeprefix on` atau `.modeprefix off`';
    }
};