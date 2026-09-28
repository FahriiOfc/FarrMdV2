// command/vps/aptsearch.js
// 🔍 Cari package APT + Status Installed

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    name: 'aptsearch',
    aliases: ['apts', 'aptfind'],
    category: 'vps',
    description: '🔍 Cari package di APT + status installed',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react, reply } = ctx;

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '🔍 *APT Search*\n\n' +
                '❌ Masukkan kata kunci!\n\n' +
                '📌 *Contoh:*\n' +
                '.aptsearch python\n' +
                '.aptsearch git\n' +
                '.aptsearch ffmpeg'
            );
        }

        const query = args.join(' ');
        await react('⏳');

        try {
            // Ambil daftar package yang sudah terinstall
            const { stdout: installedStdout } = await execAsync(
                'dpkg -l | grep ^ii | awk \'{print $2}\'',
                { timeout: 30000 }
            );
            const installedPackages = new Set(installedStdout.split('\n').filter(Boolean));

            // Cari package
            const { stdout, stderr } = await execAsync(
                `apt search ${query} --names-only | head -n 30`,
                { timeout: 30000, maxBuffer: 1024 * 1024 }
            );

            if (stderr && !stderr.includes('apt')) {
                console.log('[APTSEARCH] Stderr:', stderr);
            }

            const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Sorting') && !line.includes('Full Text Search'));

            let result = `🔍 *APT Search: "${query}"*\n`;
            result += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            if (lines.length === 0) {
                result += '❌ Tidak ada package ditemukan.';
            } else {
                let count = 0;
                let currentPackage = {};

                for (const line of lines) {
                    const match = line.match(/^(\S+)\/([^\s]+)\s+(.+)$/);
                    if (match) {
                        const name = match[1];
                        const version = match[2];
                        const description = match[3] || 'Tidak ada deskripsi';
                        const isInstalled = installedPackages.has(name);

                        count++;
                        result += `${count}. *${name}*\n`;
                        result += `   📦 v${version}\n`;
                        result += `   📝 ${description}\n`;
                        result += `   ${isInstalled ? '✅ *Status:* Terinstall' : '⬜ *Status:* Belum terinstall'}\n\n`;
                    } else if (line.trim() && !line.includes('Sorting') && !line.includes('Full Text Search')) {
                        // Fallback untuk format lain
                        const parts = line.trim().split(/\s+/);
                        const name = parts[0] || 'Unknown';
                        const isInstalled = installedPackages.has(name);
                        result += `• ${name}${isInstalled ? ' ✅' : ' ⬜'}\n`;
                    }
                }

                // Info total
                result += `━━━━━━━━━━━━━━━━━━━━\n`;
                result += `📊 Total: ${lines.length} package ditemukan.`;
            }

            await react('✅');
            return result;

        } catch (error) {
            console.error('[APTSEARCH] Error:', error.message);
            await react('❌');

            if (error.code === 'ENOENT') {
                return '❌ APT tidak ditemukan. Pastikan APT terinstall.';
            }

            return `❌ Gagal mencari package: ${error.message}`;
        }
    }
};