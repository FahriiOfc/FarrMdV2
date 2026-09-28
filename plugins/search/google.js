// command/search/google.js
import { GoogleSearch } from '../../scraper/google.js';

export default {
    name: 'google',
    aliases: ['gsearch', 'search'],
    category: 'search',
    description: 'Cari informasi di Google',

    async execute(ctx) {
        const { args, quoted } = ctx;
        const query = args.join(' ') || quoted?.text || '';
        if (!query) {
            return '❌ Masukkan kata kunci pencarian!\n\n📌 Contoh: .google berita terbaru';
        }
        await ctx.react('⏳');
        try {
            const result = await GoogleSearch(query);
            if (!result.status || !result.results || result.results.length === 0) {
                await ctx.react('❌');
                return '❌ Tidak ada hasil untuk pencarian tersebut.';
            }
            await ctx.react('✅');
            let output = `🔍 *Google Search: "${query}"*\n`;
            output += `📊 ${result.results.length} hasil\n`;
            output += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            const maxResults = Math.min(result.results.length, 10);
            for (let i = 0; i < maxResults; i++) {
                const item = result.results[i];
                output += `${i + 1}. *${item.resource_title || 'No title'}*\n`;
                output += `   🔗 ${item.resolved_endpoint || item.origin_node || '#'}\n`;
                if (item.temporal_stamp) {
                    output += `   📅 ${item.temporal_stamp}\n`;
                }
                output += '\n';
            }
            if (result.results.length > 10) {
                output += `... dan ${result.results.length - 10} hasil lainnya.`;
            }
            return output;
        } catch (error) {
            console.error('[GOOGLE] Error:', error.message);
            await ctx.react('❌');
            return `❌ ${error.message || 'Gagal mencari'}`;
        }
    }
};