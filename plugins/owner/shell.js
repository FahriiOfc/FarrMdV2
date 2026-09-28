// command/owner/shell.js
// ⚡ Shell - Waktu eksekusi akurat

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================
// FUNGSI BERSIHIN ANSI (KHUSUS PM2 STATUS)
// ============================================================

function cleanAnsi(text) {
    return text
        .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
        .replace(/\u001b\[[0-9;]*m/g, '')
        .replace(/\[[0-9]+m/g, '');
}

export default {
    name: 'shell',
    aliases: ['$', 'cmd', 'terminal', 'exec'],
    category: 'owner',
    description: '⚡ Jalankan perintah shell (output mentah)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react, send } = ctx;

        if (!args || args.length === 0) {
            await react('❌');
            return (
                '⚡ *Shell Command*\n\n' +
                '❌ Masukkan perintah!\n\n' +
                '📌 *Contoh:*\n' +
                '.shell ls -la\n' +
                '$ ls -la\n' +
                '.shell whoami\n' +
                '.shell pm2 status'
            );
        }

        const command = args.join(' ');
        await react('⏳');

        const sent = await send({
            text: `$ ${command}\n\n⏳ Menjalankan...`
        });

        const start = process.hrtime.bigint();

        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: 120000,
                maxBuffer: 1024 * 1024 * 100,
                shell: '/bin/bash',
                cwd: process.cwd()
            });

            const elapsedNs = Number(process.hrtime.bigint() - start);
            const elapsed = (elapsedNs / 1000000000).toFixed(2);

            let output = (stdout + stderr).trim();

            // PENGECUALIAN: PM2 STATUS
            if (command.trim().startsWith('pm2 status') && output) {
                output = cleanAnsi(output);
            }

            if (!output) {
                output = '✅ Done (no output)';
            }

            await send({
                text: `$ ${command}\n\n${output}\n\n⏱️ ${elapsed}s`,
                edit: sent.key
            });

            await react('✅');

        } catch (error) {
            const stdout = error.stdout || '';
            const stderr = error.stderr || '';
            let output = (stdout + stderr).trim();

            const elapsedNs = Number(process.hrtime.bigint() - start);
            const elapsed = (elapsedNs / 1000000000).toFixed(2);

            if (command.trim().startsWith('pm2 status') && output) {
                output = cleanAnsi(output);
            }

            if (!output) {
                output = `❌ ${error.message}`;
            }

            await send({
                text: `$ ${command}\n\n${output}\n\n⏱️ ${elapsed}s (error)`,
                edit: sent.key
            });

            await react('❌');
        }
    }
};