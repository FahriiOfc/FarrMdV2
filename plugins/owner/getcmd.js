// command/owner/getcmd.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(path.dirname(__dirname));
const COMMAND_DIR = path.join(PROJECT_ROOT, 'plugins');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const SCRAPER_DIR = path.join(PROJECT_ROOT, 'scraper');

export default {
    name: 'getcmd',
    aliases: ['gp'],
    category: 'owner',
    description: 'Get source code with interactive menu',
    ownerOnly: true,

    async execute(ctx) {
        const { isOwner, sock, chat, args, sender, message, jid, serializer, config } = ctx;

        if (!isOwner) {
            console.log(`[GETCMD] Blocked non-owner: ${sender}`);
            return;
        }

        const filePath = args.join(' ') || '';

        // ============================================================
        // 1. JIKA TANPA ARGUMEN → MENU UTAMA
        // ============================================================

        if (!filePath) {
            await ctx.react('⏳');

            const headerText = 
                `📄 *GETCMD - SOURCE VIEWER*\n\n` +
                `📌 Pilih direktori sumber:`;

            const buttonMessage = {
                text: headerText,
                footer: '📱 FarrMdV1 - Pilih sumber',
                buttons: [
                    {
                        buttonId: 'getcmd_menu_command',
                        buttonText: { displayText: '📁 command/' },
                        type: 1
                    },
                    {
                        buttonId: 'getcmd_menu_lib',
                        buttonText: { displayText: '📁 lib/' },
                        type: 1
                    },
                    {
                        buttonId: 'getcmd_menu_scraper',
                        buttonText: { displayText: '📁 scraper/' },
                        type: 1
                    }
                ],
                headerType: 1
            };

            try {
                await sock.sendMessage(chat, buttonMessage);
                await ctx.react('✅');
                return;
            } catch (error) {
                console.log('[GETCMD] Menu error:', error.message);
                return (
                    `📄 *GETCMD*\n\n` +
                    `.getcmd command/\n` +
                    `.getcmd lib/\n` +
                    `.getcmd scraper/\n` +
                    `.getcmd command/main/ping.js`
                );
            }
        }

        // ============================================================
        // 2. NORMALISASI PATH
        // ============================================================

        let targetPath = filePath;
        if (!targetPath.endsWith('/') && !targetPath.includes('.')) {
            targetPath = targetPath + '/';
        }

        const normalized = path.normalize(targetPath);
        const fullPath = path.resolve(PROJECT_ROOT, normalized);

        const isInCommand = fullPath.startsWith(COMMAND_DIR);
        const isInLib = fullPath.startsWith(LIB_DIR);
        const isInScraper = fullPath.startsWith(SCRAPER_DIR);

        // ============================================================
        // 3. JIKA PATH ADALAH FOLDER → LIST MESSAGE
        // ============================================================

        if ((isInCommand || isInLib || isInScraper) && !fullPath.endsWith('.js')) {
            try {
                await fs.access(fullPath);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    // FOLDER command/
                    if (fullPath === COMMAND_DIR) {
                        await ctx.react('⏳');
                        
                        const entries = await fs.readdir(fullPath, { withFileTypes: true });
                        const folders = [];
                        let totalFiles = 0;
                        
                        for (const entry of entries) {
                            if (entry.isDirectory()) folders.push(entry.name);
                        }
                        folders.sort();

                        if (folders.length === 0) {
                            await ctx.react('❌');
                            return '📁 *command/*\n\nTidak ada folder.';
                        }

                        for (const folder of folders) {
                            const folderPath = path.join(fullPath, folder);
                            const files = await fs.readdir(folderPath);
                            const jsFiles = files.filter(f => f.endsWith('.js'));
                            totalFiles += jsFiles.length;
                        }

                        const sections = [];

                        for (const folder of folders) {
                            const folderPath = path.join(fullPath, folder);
                            const files = await fs.readdir(folderPath);
                            const jsFiles = files.filter(f => f.endsWith('.js')).sort();

                            const rows = jsFiles.map(file => {
                                const fileName = file.replace('.js', '');
                                return {
                                    title: `📄 ${file}`,
                                    rowId: `getcmd_cmd_${folder}_${fileName}`,
                                    description: `File di command/${folder}`
                                };
                            });

                            if (rows.length === 0) {
                                rows.push({
                                    title: '📂 Kosong',
                                    rowId: `getcmd_cmd_${folder}_empty`,
                                    description: `Tidak ada file di ${folder}/`
                                });
                            }

                            sections.push({
                                title: `📁 ${folder}/`,
                                rows: rows
                            });
                        }

                        await sock.sendMessage(chat, {
                            text: '📌 *GETCMD - Pilih File*\n\nPilih file yang ingin dilihat source code-nya:',
                            title: '📁 command/',
                            footer: `📱 Total: ${folders.length} folders, ${totalFiles} files`,
                            buttonText: '📋 Buka Daftar',
                            sections: sections
                        });

                        await ctx.react('✅');
                        return;
                    }

                    // FOLDER lib/
                    if (fullPath === LIB_DIR) {
                        await ctx.react('⏳');
                        
                        const entries = await fs.readdir(fullPath, { withFileTypes: true });
                        const jsFiles = [];
                        for (const entry of entries) {
                            if (entry.isFile() && entry.name.endsWith('.js')) {
                                jsFiles.push(entry.name);
                            }
                        }
                        jsFiles.sort();

                        if (jsFiles.length === 0) {
                            await ctx.react('❌');
                            return '📁 *lib/*\n\nTidak ada file.';
                        }

                        const rows = jsFiles.map(file => {
                            const fileName = file.replace('.js', '');
                            return {
                                title: `📄 ${file}`,
                                rowId: `getcmd_lib_${fileName}`,
                                description: `File library ${file}`
                            };
                        });

                        const sections = [];
                        const maxRowsPerSection = 10;
                        for (let i = 0; i < rows.length; i += maxRowsPerSection) {
                            const chunk = rows.slice(i, i + maxRowsPerSection);
                            sections.push({
                                title: `📁 File ${Math.floor(i / maxRowsPerSection) + 1}`,
                                rows: chunk
                            });
                        }

                        await sock.sendMessage(chat, {
                            text: '📌 *GETCMD - Pilih File*\n\nPilih file di lib/:',
                            title: '📁 lib/',
                            footer: `📱 Total: ${jsFiles.length} files`,
                            buttonText: '📋 Buka Daftar',
                            sections: sections
                        });

                        await ctx.react('✅');
                        return;
                    }

                    // FOLDER scraper/
                    if (fullPath === SCRAPER_DIR) {
                        await ctx.react('⏳');
                        
                        const entries = await fs.readdir(fullPath, { withFileTypes: true });
                        const jsFiles = [];
                        for (const entry of entries) {
                            if (entry.isFile() && entry.name.endsWith('.js')) {
                                jsFiles.push(entry.name);
                            }
                        }
                        jsFiles.sort();

                        if (jsFiles.length === 0) {
                            await ctx.react('❌');
                            return '📁 *scraper/*\n\nTidak ada file.';
                        }

                        const rows = jsFiles.map(file => {
                            const fileName = file.replace('.js', '');
                            return {
                                title: `📄 ${file}`,
                                rowId: `getcmd_scraper_${fileName}`,
                                description: `File scraper ${file}`
                            };
                        });

                        const sections = [];
                        const maxRowsPerSection = 10;
                        for (let i = 0; i < rows.length; i += maxRowsPerSection) {
                            const chunk = rows.slice(i, i + maxRowsPerSection);
                            sections.push({
                                title: `📁 File ${Math.floor(i / maxRowsPerSection) + 1}`,
                                rows: chunk
                            });
                        }

                        await sock.sendMessage(chat, {
                            text: '📌 *GETCMD - Pilih File*\n\nPilih file scraper yang ingin dilihat:',
                            title: '📁 scraper/',
                            footer: `📱 Total: ${jsFiles.length} files`,
                            buttonText: '📋 Buka Daftar',
                            sections: sections
                        });

                        await ctx.react('✅');
                        return;
                    }

                    // FOLDER ai-modules/
                    if (fullPath === AI_MODULES_DIR) {
                        await ctx.react('⏳');
                        
                        const entries = await fs.readdir(fullPath, { withFileTypes: true });
                        const jsFiles = [];
                        
                        for (const entry of entries) {
                            if (entry.isDirectory()) {
                                const subDir = path.join(fullPath, entry.name);
                                const subEntries = await fs.readdir(subDir, { withFileTypes: true });
                                for (const sub of subEntries) {
                                    if (sub.isFile() && sub.name.endsWith('.js')) {
                                        jsFiles.push({
                                            name: `${entry.name}/${sub.name}`,
                                            display: `${entry.name}/${sub.name}`
                                        });
                                    }
                                }
                            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                                jsFiles.push({
                                    name: entry.name,
                                    display: entry.name
                                });
                            }
                        }
                        
                        jsFiles.sort((a, b) => a.name.localeCompare(b.name));

                        if (jsFiles.length === 0) {
                            await ctx.react('❌');
                            return '📁 *ai-modules/*\n\nTidak ada file.';
                        }

                        const rows = jsFiles.map(file => ({
                            title: `📄 ${file.display}`,
                            rowId: `getcmd_ai_${file.name.replace('/', '_').replace('.js', '')}`,
                            description: `File di ai-modules/${file.display}`
                        }));

                        const sections = [];
                        const maxRowsPerSection = 10;
                        for (let i = 0; i < rows.length; i += maxRowsPerSection) {
                            const chunk = rows.slice(i, i + maxRowsPerSection);
                            sections.push({
                                title: `📁 File ${Math.floor(i / maxRowsPerSection) + 1}`,
                                rows: chunk
                            });
                        }

                        await sock.sendMessage(chat, {
                            text: '📌 *GETCMD - Pilih File AI*\n\nPilih file yang ingin dilihat source code-nya:',
                            title: '🤖 ai-modules/',
                            footer: `📱 Total: ${jsFiles.length} files`,
                            buttonText: '📋 Buka Daftar',
                            sections: sections
                        });

                        await ctx.react('✅');
                        return;
                    }
                    
                    // Folder lain → tampilkan text
                    const entries = await fs.readdir(fullPath, { withFileTypes: true });
                    const folders = [];
                    const files = [];
                    
                    for (const entry of entries) {
                        if (entry.isDirectory()) folders.push(entry.name);
                        else if (entry.isFile() && entry.name.endsWith('.js')) files.push(entry.name);
                    }
                    
                    folders.sort();
                    files.sort();
                    
                    const relativePath = path.relative(PROJECT_ROOT, fullPath) || '.';
                    let output = `📁 *${relativePath}/*\n`;
                    output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                    
                    if (folders.length > 0) {
                        for (const folder of folders) {
                            output += `📂 ${folder}/\n`;
                            output += `   💡 .getcmd ${relativePath}/${folder}/\n\n`;
                        }
                    }
                    
                    if (files.length > 0) {
                        for (const file of files) {
                            output += `📄 ${file}\n`;
                            output += `   💡 .getcmd ${relativePath}/${file}\n\n`;
                        }
                    }
                    
                    if (folders.length === 0 && files.length === 0) {
                        output += '📂 (Kosong)';
                    }
                    
                    output += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                    output += `📊 Total: ${folders.length + files.length} items`;
                    
                    await ctx.react('✅');
                    return output;
                }
            } catch (error) {
                console.log('[GETCMD] Directory error:', error.message);
            }
        }

        // ============================================================
        // 4. JIKA PATH ADALAH FILE → TAMPILKAN SOURCE
        // ============================================================

        if (!isInCommand && !isInLib && !isInScraper) {
            return '❌ Path harus di command/, lib/, scraper/, atau ai-modules/';
        }

        if (!fullPath.endsWith('.js')) {
            return '❌ File harus .js';
        }

        try {
            await fs.access(fullPath);
        } catch {
            return `❌ File tidak ditemukan: ${filePath}`;
        }

        let source;
        let fileName;
        let fileSize;

        try {
            source = await fs.readFile(fullPath, 'utf8');
            fileName = path.basename(fullPath);
            fileSize = (source.length / 1024).toFixed(2);
        } catch (error) {
            return `❌ Gagal membaca file: ${error.message}`;
        }

        const relativePath = path.relative(PROJECT_ROOT, fullPath);
        const totalLines = source.split('\n').length;

        // ============================================================
        // 5. SIMPAN SESSION UNTUK BUTTON OUTPUT
        // ============================================================

        const sessionId = `getcmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        global.getcmdSessions = global.getcmdSessions || new Map();

        for (const [key, val] of global.getcmdSessions) {
            if (Date.now() - val.created > 300000) {
                global.getcmdSessions.delete(key);
            }
        }

        global.getcmdSessions.set(sessionId, {
            source,
            fileName,
            relativePath,
            fileSize,
            totalLines,
            created: Date.now()
        });

        // ============================================================
        // 6. TAMPILKAN BUTTON OUTPUT (Text / File)
        // ============================================================

        const headerText = 
            `📄 *GETCMD*\n\n` +
            `📁 ${relativePath}\n` +
            `📊 ${totalLines} lines\n` +
            `📦 ${fileSize} KB\n\n` +
            `📌 Pilih format output:`;

        const buttonMessage = {
            text: headerText,
            footer: '📱 FarrMdV1 - Pilih format',
            buttons: [
                {
                    buttonId: `text_${sessionId}`,
                    buttonText: { displayText: '📄 Text' },
                    type: 1
                },
                {
                    buttonId: `file_${sessionId}`,
                    buttonText: { displayText: '📁 File (.js)' },
                    type: 1
                }
            ],
            headerType: 1
        };

        try {
            await sock.sendMessage(chat, buttonMessage);
            await ctx.react('✅');
            return;
        } catch (error) {
            console.log('[GETCMD] Button error:', error.message);
            const maxChars = 3800;
            let text = `📄 *${relativePath}*\n📊 ${totalLines} lines\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            text += source.length > maxChars ? source.slice(0, maxChars - 200) + '\n\n... (terpotong)' : source;
            return text;
        }
    }
};
