// command/downloader/github.js

import downloader from '../../lib/downloader.js';

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
    name: 'github',
    aliases: [],
    category: 'downloader',
    description: 'Download GitHub repository as ZIP',

    async execute(ctx) {
        const { sock, chat } = ctx;
        let url = ctx.text || ctx.args.join(' ') || '';

        if (!url && ctx.quoted?.text) {
            url = ctx.quoted.text;
        }

        if (url) {
            const urlMatch = url.match(/(https?:\/\/[^\s]+)/i);
            if (urlMatch) {
                url = urlMatch[0];
            }
        }

        if (!url) {
            return (
                '❌ Masukkan URL!\n\n' +
                '📥 *Cara penggunaan:*\n' +
                '`.github <url>`\n\n' +
                'Contoh:\n' +
                '`.github https://github.com/user/repo`'
            );
        }

        await ctx.react('⏳');

        try {
            const result = await downloader.github(url);
            
            if (!result) {
                await ctx.react('❌');
                return '❌ Gagal mengunduh. Coba URL lain.';
            }

            await sock.sendMessage(chat, {
                document: result.data,
                fileName: `${result.name}.zip`,
                mimetype: 'application/zip',
                caption: `📦 *${result.author}/${result.repo}*\n📁 Size: ${formatFileSize(result.size)}`
            });

            await ctx.react('✅');
            return '✅ Selesai!';
        } catch (error) {
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mengunduh'}`;
        }
    }
};