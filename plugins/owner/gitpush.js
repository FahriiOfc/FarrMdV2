// command/owner/gitpush.js
// 🤖 Auto update & push ke GitHub (FIXED maxBuffer)

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// ============================================================
// DAFTAR FILE/FOLDER YANG DI-EXCLUDE
// ============================================================

const EXCLUDED = [
    'auth',
    'node_modules',
    '.env',
    'temp',
    'backup',
    '.git',
    'package-lock.json',
    '*.log',
    '*.bak'
];

// ============================================================
// CEK APAKAH FILE/FOLDER HARUS DI-EXCLUDE
// ============================================================

function shouldExclude(filePath) {
    for (const pattern of EXCLUDED) {
        if (pattern.includes('*')) {
            const ext = pattern.replace('*', '');
            if (filePath.endsWith(ext)) return true;
        } else {
            if (filePath === pattern || filePath.startsWith(pattern + '/')) return true;
        }
    }
    return false;
}

export default {
    name: 'gitpush',
    aliases: ['update', 'push', 'gitsync'],
    category: 'owner',
    description: '🤖 Auto update & push ke GitHub (exclude auth, node_modules, .env)',
    ownerOnly: true,

    async execute(ctx) {
        const { args, react, send } = ctx;

        let commitMessage = args.length > 0
            ? args.join(' ')
            : `Auto update: ${new Date().toLocaleString('id-ID')}`;

        await react('⏳');

        const sent = await send({
            text: `🤖 *GitHub Auto Push*\n━━━━━━━━━━━━━━━━━━━━\n\n⏳ Memulai proses...`
        });

        const start = process.hrtime.bigint();

        try {
            // ============================================================
            // STEP 1: Cek status git (dengan maxBuffer besar)
            // ============================================================

            let output = `🤖 *GitHub Auto Push*\n━━━━━━━━━━━━━━━━━━━━\n\n`;

            // 🔥 maxBuffer 50MB
            const { stdout: statusOut } = await execAsync('git status --porcelain', {
                cwd: process.cwd(),
                maxBuffer: 1024 * 1024 * 50
            });

            const changedFiles = statusOut.split('\n')
                .filter(f => f.trim())
                .map(f => {
                    const status = f.substring(0, 2).trim();
                    const filename = f.substring(3);
                    return { status, filename };
                });

            const filteredFiles = changedFiles.filter(f => !shouldExclude(f.filename));

            if (filteredFiles.length === 0) {
                output += `✅ *Tidak ada perubahan yang perlu di-push*\n\n`;
                if (changedFiles.length > 0) {
                    output += `📌 File yang di-exclude:\n`;
                    for (const f of changedFiles.slice(0, 10)) {
                        output += `  ⏭️ ${f.filename}\n`;
                    }
                    if (changedFiles.length > 10) {
                        output += `  ... dan ${changedFiles.length - 10} lainnya\n`;
                    }
                }
                await send({ text: output, edit: sent.key });
                await react('✅');
                return;
            }

            // Tampilkan file yang akan di-push
            output += `📄 *File akan di-push:*\n`;
            for (const f of filteredFiles.slice(0, 15)) {
                const emoji = f.status === 'M' ? '✏️' : f.status === 'A' ? '➕' : f.status === 'D' ? '➖' : '📄';
                output += `  ${emoji} ${f.filename}\n`;
            }
            if (filteredFiles.length > 15) {
                output += `  ... dan ${filteredFiles.length - 15} file lainnya\n`;
            }

            if (changedFiles.length > filteredFiles.length) {
                const excluded = changedFiles.length - filteredFiles.length;
                output += `\n⏭️ ${excluded} file di-exclude (auth, node_modules, .env, dll)`;
            }

            output += `\n\n`;
            await send({ text: output, edit: sent.key });

            // ============================================================
            // STEP 2: Git add .
            // ============================================================

            output += `📦 *Step 1/4:* Menambahkan file yang diizinkan...\n`;
            await send({ text: output, edit: sent.key });

            for (const f of filteredFiles) {
                await execAsync(`git add "${f.filename}"`, {
                    cwd: process.cwd(),
                    maxBuffer: 1024 * 1024 * 50
                });
            }

            // ============================================================
            // STEP 3: Git commit
            // ============================================================

            output += `📦 *Step 2/4:* Commit perubahan...\n`;
            output += `📝 *Pesan:* ${commitMessage}\n`;
            await send({ text: output, edit: sent.key });

            await execAsync(`git commit -m "${commitMessage}"`, {
                cwd: process.cwd(),
                maxBuffer: 1024 * 1024 * 50
            });

            // ============================================================
            // STEP 4: Git push (dengan maxBuffer besar & timeout)
            // ============================================================

            output += `📦 *Step 3/4:* Push ke GitHub...\n`;
            await send({ text: output, edit: sent.key });

            // 🔥 maxBuffer 50MB, timeout 2 menit
            const { stdout, stderr } = await execAsync('git push origin main', {
                cwd: process.cwd(),
                timeout: 120000,
                maxBuffer: 1024 * 1024 * 50
            });

            // ============================================================
            // STEP 5: Selesai
            // ============================================================

            const elapsed = Number(process.hrtime.bigint() - start) / 1000000000;

            output += `📦 *Step 4/4:* Selesai!\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            output += `✅ *Push berhasil!*\n\n`;

            output += `📄 *${filteredFiles.length} file berhasil di-push*\n`;
            output += `📝 *Commit:* ${commitMessage}\n`;
            output += `⏱️ *Waktu:* ${elapsed.toFixed(2)}s\n`;
            output += `🔗 *Repo:* https://github.com/FahriiOfc/base-FarrMdV1`;

            if (stderr && !stderr.includes('warning')) {
                output += `\n\n⚠️ *Stderr:*\n${stderr.slice(0, 500)}${stderr.length > 500 ? '...' : ''}`;
            }

            await send({ text: output, edit: sent.key });
            await react('✅');

        } catch (error) {
            console.error('[GITPUSH] Error:', error.message);

            let output = `🤖 *GitHub Auto Push*\n━━━━━━━━━━━━━━━━━━━━\n\n`;

            // 🔥 Tampilkan error dengan maxBuffer yang lebih besar
            const errMsg = error.message || 'Unknown error';
            const stderrMsg = error.stderr || '';

            if (errMsg.includes('maxBuffer')) {
                output += `❌ *Buffer overflow!*\n\n`;
                output += `📌 Output terlalu besar untuk ditampilkan.\n`;
                output += `💡 Tapi proses git push tetap berjalan di background.\n\n`;
                output += `📝 *Commit:* ${commitMessage}\n`;
                output += `🔗 *Repo:* https://github.com/FahriiOfc/base-FarrMdV1\n\n`;
                output += `✅ *Cek repo GitHub untuk memastikan!*`;
            } else {
                output += `❌ *Error:* ${errMsg}\n\n`;
                if (stderrMsg) {
                    output += `📤 *Detail:*\n\`\`\`\n${stderrMsg.slice(0, 500)}${stderrMsg.length > 500 ? '...' : ''}\n\`\`\``;
                }

                if (errMsg.includes('not a git repository')) {
                    output += `\n\n💡 *Solusi:* Pastikan kamu di direktori project Git.`;
                } else if (errMsg.includes('Permission denied')) {
                    output += `\n\n💡 *Solusi:* Cek SSH key: \`ssh -T git@github.com\``;
                }
            }

            await send({ text: output, edit: sent.key });
            await react('❌');
        }
    }
};