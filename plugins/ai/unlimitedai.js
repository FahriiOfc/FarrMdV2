// command/ai/unlimitedai.js
// Unlimited AI - 5 Karakter (Ourin, Kobo, Waguri, Jokowi, Prabowo)

import { UnlimitedAI, CHARACTERS } from '../../scraper/unlimitedai.js';

export default {
    name: 'unlimitedai',
    aliases: ['uai'],
    category: 'ai',
    description: 'Chat dengan AI (5 karakter: ourin, kobo, waguri, jokowi, prabowo)',

    async execute(ctx) {
        const { args, quoted } = ctx;

        if (args.length === 0 && !quoted?.text) {
            return (
                '❌ Masukkan pertanyaan!\n\n' +
                '📌 *Karakter:*\n' +
                '• ourin   - Asisten ramah\n' +
                '• kobo    - VTuber cheerful\n' +
                '• waguri  - Gadis pemalu\n' +
                '• jokowi  - Pak Jokowi\n' +
                '• prabowo - Pak Prabowo\n\n' +
                '📌 *Contoh:*\n' +
                '.unlimitedai ourin Halo\n' +
                '.unlimitedai kobo Apa kabar?\n' +
                '.unlimitedai jokowi Bagaimana pembangunan?'
            );
        }

        // Deteksi karakter dari argumen pertama
        let character = 'ourin-ai';
        let prompt = args.join(' ');

        const charKeys = Object.keys(CHARACTERS);
        for (const key of charKeys) {
            const charName = key.replace('-ai', '');
            if (args[0]?.toLowerCase() === charName) {
                character = key;
                prompt = args.slice(1).join(' ') || '';
                break;
            }
        }

        // Jika tidak ada karakter yang cocok, gunakan ourin-ai
        if (prompt === args.join(' ') && args.length > 0) {
            // Cek apakah argumen pertama adalah nama karakter
            const firstArg = args[0]?.toLowerCase();
            if (firstArg && charKeys.some(k => k.replace('-ai', '') === firstArg)) {
                // Sudah ditangani di atas
            } else {
                prompt = args.join(' ');
                character = 'ourin-ai';
            }
        }

        if (!prompt) {
            await ctx.react('❌');
            return '❌ Masukkan pertanyaan!';
        }

        await ctx.react('⏳');

        try {
            const result = await UnlimitedAI(prompt, character);
            
            if (!result.status) {
                await ctx.react('❌');
                return `❌ Gagal: ${result.error || 'Unknown error'}`;
            }

            await ctx.react('✅');
            
            let answer = result.answer || 'Tidak ada jawaban';
            const charName = result.character || CHARACTERS[character]?.name || 'AI';
            
            if (answer.length > 4000) {
                answer = answer.slice(0, 3800) + '\n\n... (pesan terpotong)';
            }
            
            return `💬 *${charName}*\n\n${answer}`;
        } catch (error) {
            console.error('[UNLIMITEDAI] Error:', error.message);
            await ctx.react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};