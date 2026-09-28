// command/vps/npmsearch.js
// 🔍 Cari package NPM + Status Installed

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'npmsearch',
    aliases: ['npms', 'npmfind'],
    category: 'vps',
    description: '🔍 Cari package di NPM + status installed',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react, reply } = ctx;

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '🔍 *NPM Search*\n\n' +
                '❌ Masukkan kata kunci!\n\n' +
                '📌 *Contoh:*\n' +
                '.npmsearch axios\n' +
                '.npmsearch express\n' +
                '.npmsearch discord.js'
            );
        }

        const query = args.join(' ');
        await react('⏳');

        try {
            // Ambil daftar package global yang terinstall
            let globalPackages = new Set();
            try {
                const { stdout: globalStdout } = await execAsync(
                    'npm list -g --depth=0 --json',
                    { timeout: 30000 }
                );
                const globalData = JSON.parse(globalStdout);
                if (globalData.dependencies) {
                    globalPackages = new Set(Object.keys(globalData.dependencies));
                }
            } catch (e) {
                console.log('[NPMSEARCH] Gagal ambil global packages:', e.message);
            }

            // Cari package
            const { stdout, stderr } = await execAsync(
                `npm search ${query} --no-description --json --limit 15`,
                {
                    timeout: 30000,
                    maxBuffer: 1024 * 1024
                }
            );

            if (stderr && !stderr.includes('npm notice')) {
                console.log('[NPMSEARCH] Stderr:', stderr);
            }

            let result = `🔍 *NPM Search: "${query}"*\n`;
            result += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            try {
                const data = JSON.parse(stdout);
                const packages = Array.isArray(data) ? data : Object.values(data);

                if (packages.length === 0) {
                    result += '❌ Tidak ada package ditemukan.';
                } else {
                    for (let i = 0; i < packages.length; i++) {
                        const pkg = packages[i];
                        const name = pkg.name || pkg.package?.name || 'Unknown';
                        const version = pkg.version || pkg.package?.version || '-';
                        const description = pkg.description || pkg.package?.description || 'Tidak ada deskripsi';

                        const isInstalled = globalPackages.has(name);

                        result += `${i + 1}. *${name}*\n`;
                        result += `   📦 v${version}\n`;
                        result += `   📝 ${description}\n`;
                        result += `   ${isInstalled ? '✅ *Status:* Terinstall (global)' : '⬜ *Status:* Belum terinstall'}\n\n`;
                    }
                }

                result += `━━━━━━━━━━━━━━━━━━━━\n`;
                result += `📊 Total: ${packages.length} package ditemukan.`;

            } catch (parseError) {
                // Jika bukan JSON, tampilkan output mentah
                result += `\`\`\`\n${stdout}\n\`\`\``;
            }

            await react('✅');
            return result;

        } catch (error) {
            console.error('[NPMSEARCH] Error:', error.message);
            await react('❌');

            if (error.code === 'ENOENT') {
                return '❌ NPM tidak ditemukan. Pastikan NPM terinstall.';
            }

            return `❌ Gagal mencari package: ${error.message}`;
        }
    }
};