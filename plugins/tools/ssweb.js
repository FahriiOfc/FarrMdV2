// command/tools/ssweb.js

import axios from 'axios';

export default {
    name: 'ssweb',
    aliases: ['ss', 'screenshot'],
    category: 'tools',
    description: 'Take screenshot of a website',

    async execute(ctx) {
        const { sock, chat, message } = ctx;
        let urlInput = ctx.text || ctx.args.join(' ') || '';

        // Try to get URL from quoted message
        if (!urlInput && ctx.quoted?.text) {
            urlInput = ctx.quoted.text;
        }

        urlInput = urlInput.trim();

        if (!urlInput) {
            return (
                '❌ Masukkan URL website!\n\n' +
                'Contoh:\n' +
                '.ssweb google.com\n' +
                '.ss https://youtube.com'
            );
        }

        // Add https:// if not present
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            urlInput = 'https://' + urlInput;
        }

        await ctx.react('⏳');

        try {
            const encodedUrl = encodeURIComponent(urlInput);
            const apiUrl = `https://api.zaxiusaja.xyz/tools/ssweb?url=${encodedUrl}`;
            console.log(`[SSWEB] Fetching: ${apiUrl}`);

            const jsonResponse = await axios.get(apiUrl, { timeout: 25000 });

            if (!jsonResponse.data?.status || !jsonResponse.data?.result?.screenshotUrl) {
                throw new Error('API tidak mengembalikan link gambar yang valid.');
            }

            const imageUrl = jsonResponse.data.result.screenshotUrl;
            console.log(`[SSWEB] Image URL: ${imageUrl}`);

            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            if (!imageResponse.data || imageResponse.data.length < 2048) {
                throw new Error('Gambar yang diterima terlalu kecil/rusak.');
            }

            await sock.sendMessage(chat, {
                image: Buffer.from(imageResponse.data),
                caption: `📸 *Screenshot Berhasil!*\n\n🔗 URL: ${urlInput}`
            });

            await ctx.react('✅');
            return;
        } catch (error) {
            await ctx.react('❌');
            let errorMsg = '🛑 Gagal mengambil screenshot.\n\n';
            if (error.message.includes('timeout')) {
                errorMsg += '⏱️ Timeout (website lambat atau API sibuk). Coba lagi nanti.';
            } else {
                errorMsg += `Error: ${error.message}`;
            }
            return errorMsg;
        }
    }
};