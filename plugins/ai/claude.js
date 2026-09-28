// command/ai/claude.js
// Claude Haiku AI - Overchat.ai

import { ClaudeHaiku } from '../../scraper/claudehaiku.js';

export default {
    name: 'claude',
    aliases: ['haiku'],
    category: 'ai',
    description: 'Chat dengan Claude Haiku AI',

    async execute(ctx) {
        const { args, quoted } = ctx;

        // Ambil prompt dari argumen atau reply
        let prompt = args.join(' ') || quoted?.text || '';
        if (!prompt) {
            return (
                '❌ Masukkan pertanyaan!\n\n' +
                '📌 *Contoh:*\n' +
                '.claude Apa itu kecerdasan buatan?'
            );
        }

        await ctx.react('⏳');

        try {
            const result = await ClaudeHaiku(prompt);
            
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
            console.error('[CLAUDE] Error:', error.message);
            await ctx.react('❌');
            return `❌ Error: ${error.message}`;
        }
    }
};