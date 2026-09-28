// command/ai/gpt5.js
// GPT-5 AI - Overchat.ai

import { GPT5 } from '../../scraper/gpt5.js';

export default {
    name: 'gpt5',
    aliases: [],
    category: 'ai',
    description: 'Chat dengan GPT-5 AI',

    async execute(ctx) {
        const { args, quoted } = ctx;

        let prompt = args.join(' ') || quoted?.text || '';
        if (!prompt) {
            return (
                '❌ Masukkan pertanyaan!\n\n' +
                '📌 *Contoh:*\n' +
                '.gpt5 Apa itu AI?'
            );
        }

        await ctx.react('⏳');

        try {
            const result = await GPT5(prompt);
            
            if (!result.status) {
                await ctx.react('❌');
                return `❌ Gagal: ${result.error || 'Unknown error'}`;
            }

            await ctx.react('✅');
            
            let answer = result.answer || 'Tidak ada jawaban';
            if (answer.length > 4000) {
                answer = answer.slice(0, 3800) + '\n\n... (pesan terpotong)';
            }
            
            return answer;
        } catch (error) {
            console.error('[GPT5] Error:', error.message);
            await ctx.react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};