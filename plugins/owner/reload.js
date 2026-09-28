// command/owner/reload.js
// 🔄 Reload command, config, lib, scraper (ESM)

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

console.log(`[RELOAD] 📁 Project Root: ${PROJECT_ROOT}`);

// ============================================================
// RELOAD CONFIG
// ============================================================

async function reloadConfig() {
    try {
        const configPath = path.join(PROJECT_ROOT, 'config.js');
        const configUrl = new URL(`file://${configPath}?t=${Date.now()}`);
        const newConfig = await import(configUrl);
        global.config = newConfig.default;
        console.log('[RELOAD] ✅ Config reloaded');
        return true;
    } catch (error) {
        console.error('[RELOAD] ❌ Config error:', error.message);
        return false;
    }
}

// ============================================================
// RELOAD COMMANDS
// ============================================================

async function reloadCommands(commandLoader) {
    try {
        await commandLoader.scanCommands();
        const total = commandLoader.getCommands().size;
        console.log(`[RELOAD] ✅ Commands reloaded (${total} commands)`);
        return true;
    } catch (error) {
        console.error('[RELOAD] ❌ Command error:', error.message);
        return false;
    }
}

// ============================================================
// RELOAD LIB
// ============================================================

async function reloadLibFiles() {
    const libFiles = [
        'handler.js', 'settings.js', 'permissions.js', 
        'database.js', 'media.js', 'serializer.js', 
        'identity.js', 'commandLoader.js', 'connection.js'
    ];
    let successCount = 0;

    for (const file of libFiles) {
        try {
            const filePath = path.join(PROJECT_ROOT, 'lib', file);
            const fileUrl = new URL(`file://${filePath}?t=${Date.now()}`);
            await import(fileUrl);
            console.log(`[RELOAD] ✅ lib/${file} reloaded`);
            successCount++;
        } catch (error) {
            console.log(`[RELOAD] ❌ lib/${file} error:`, error.message);
        }
    }

    return successCount === libFiles.length;
}

// ============================================================
// RELOAD SCRAPER
// ============================================================

async function reloadScraperFiles() {
    try {
        const scraperDir = path.join(PROJECT_ROOT, 'scraper');
        const entries = await fs.readdir(scraperDir);
        let successCount = 0;

        for (const entry of entries) {
            if (entry.endsWith('.js')) {
                try {
                    const filePath = path.join(scraperDir, entry);
                    const fileUrl = new URL(`file://${filePath}?t=${Date.now()}`);
                    await import(fileUrl);
                    console.log(`[RELOAD] ✅ scraper/${entry} reloaded`);
                    successCount++;
                } catch (error) {
                    console.log(`[RELOAD] ❌ scraper/${entry} error:`, error.message);
                }
            }
        }

        return successCount > 0;
    } catch (error) {
        console.error('[RELOAD] ❌ Scraper error:', error.message);
        return false;
    }
}

// ============================================================
// RELOAD FILE SPESIFIK
// ============================================================

async function reloadSpecificFile(filePath) {
    try {
        const fullPath = path.resolve(PROJECT_ROOT, filePath);
        
        if (!fullPath.startsWith(PROJECT_ROOT)) {
            return { success: false, message: 'File di luar project tidak bisa di-reload' };
        }

        const fileUrl = new URL(`file://${fullPath}?t=${Date.now()}`);
        await import(fileUrl);
        console.log(`[RELOAD] ✅ ${filePath} reloaded`);
        return { success: true, message: '✅' };
    } catch (error) {
        console.error(`[RELOAD] ❌ ${filePath} error:`, error.message);
        return { success: false, message: error.message };
    }
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'reload',
    aliases: ['rl', 'refresh'],
    category: 'owner',
    description: '🔄 Reload command, config, lib, scraper',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react } = ctx;
        await react('⏳');

        const commandLoader = global.commandLoader || ctx.commandLoader;

        if (!commandLoader) {
            await react('❌');
            return '❌ Command loader tidak ditemukan!';
        }

        // ============================================================
        // PARSE ARGUMEN
        // ============================================================

        let reloadConfigs = true;
        let reloadCmds = true;
        let reloadLib = true;
        let reloadScrap = true;
        let reloadFileTarget = null;

        if (args && args.length > 0) {
            reloadConfigs = false;
            reloadCmds = false;
            reloadLib = false;
            reloadScrap = false;

            for (const arg of args) {
                if (arg === 'config') reloadConfigs = true;
                else if (arg === 'plugins') reloadCmds = true;
                else if (arg === 'lib') reloadLib = true;
                else if (arg === 'scraper') reloadScrap = true;
                else if (arg === 'all') {
                    reloadConfigs = true;
                    reloadCmds = true;
                    reloadLib = true;
                    reloadScrap = true;
                } else if (arg.endsWith('.js')) {
                    reloadFileTarget = arg;
                }
            }

            if (!reloadConfigs && !reloadCmds && !reloadLib && !reloadScrap && !reloadFileTarget) {
                reloadConfigs = true;
                reloadCmds = true;
                reloadLib = true;
                reloadScrap = true;
            }
        }

        // ============================================================
        // EKSEKUSI RELOAD
        // ============================================================

        const results = {
            config: false,
            commands: false,
            lib: false,
            scraper: false,
            ai: false,
            file: { success: false, message: '' }
        };

        if (reloadConfigs) results.config = await reloadConfig();
        if (reloadCmds) results.commands = await reloadCommands(commandLoader);
        if (reloadLib) results.lib = await reloadLibFiles();
        if (reloadScrap) results.scraper = await reloadScraperFiles();
        if (reloadFileTarget) results.file = await reloadSpecificFile(reloadFileTarget);

        // ============================================================
        // BUILD RESPONSE
        // ============================================================

        let response = `🔄 *Reload Complete*\n`;
        response += `📁 ${PROJECT_ROOT}\n\n`;

        if (reloadConfigs) response += `📄 Config: ${results.config ? '✅' : '❌'}\n`;
        if (reloadCmds) {
            const total = commandLoader.getCommands().size;
            response += `📂 Commands: ${results.commands ? `✅ (${total})` : '❌'}\n`;
        }
        if (reloadLib) response += `📦 Lib: ${results.lib ? '✅' : '❌'}\n`;
        if (reloadScrap) response += `📁 Scraper: ${results.scraper ? '✅' : '❌'}\n`;
        if (reloadFileTarget) {
            response += `📄 ${reloadFileTarget}: ${results.file.success ? '✅' : `❌ ${results.file.message}`}\n`;
        }

        const runtime = process.uptime();
        const hours = Math.floor(runtime / 3600);
        const minutes = Math.floor((runtime % 3600) / 60);
        const seconds = Math.floor(runtime % 60);
        
        response += `\n⏱️ *Runtime:* ${hours}h ${minutes}m ${seconds}s (tetap jalan!)`;
        response += `\n\n💡 *Cara penggunaan:*\n`;
        response += `.reload - Reload semua\n`;
        response += `.reload command - Reload command saja\n`;
        response += `.reload lib - Reload lib/\n`;
        response += `.reload scraper - Reload scraper/\n`;
        response += `.reload config - Reload config.js\n`;
        response += `.reload handler.js - Reload file spesifik`;

        await react('✅');
        return response;
    }
};
