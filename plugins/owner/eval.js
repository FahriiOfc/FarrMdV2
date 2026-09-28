// plugins/owner/eval.js
// 🧪 Eval - Jalankan kode JavaScript

import util from 'util';
import * as baileys from '@chaeulso/baileys';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export default {
    name: 'eval',
    aliases: ['e', 'ev'],
    category: 'owner',
    description: '🧪 Jalankan kode JavaScript (=> kode)',
    ownerOnly: true,

    customPrefix: /^=>/,

    async execute(ctx) {
        const { sock, chat, sender, message, quoted, args, text, react, reply } = ctx;

        // ============================================================
        // AMBIL CODE
        // ============================================================

        let code = '';

        // Dari text (customPrefix `=> ...`)
        if (text && text.trim()) {
            code = text.trim();
        }

        // Dari args
        if (!code && args && args.length > 0) {
            code = args.join(' ');
        }

        // Dari quoted
        if (!code && quoted?.text) {
            code = quoted.text;
        }

        if (!code || code.length === 0) {
            await react('❌');
            return (
                '🧪 *Eval*\n\n' +
                '❌ Masukkan kode JavaScript!\n\n' +
                '📌 *Contoh:*\n' +
                '=> 1 + 1\n' +
                '=> global.config\n' +
                '=> await sock.sendMessage(chat, { text: "Halo" })'
            );
        }

        await react('⏳');

        console.log('[EVAL] Code:', code.slice(0, 100));

        // ============================================================
        // DETEKSI EXPRESSION
        // ============================================================

        const isExpression =
            !/^(const|let|var|if|for|while|do|switch|try|throw|return|class|function|async\s+function)\b/.test(code) &&
            !/[;{}]\s*$/.test(code);

        const body = isExpression ? `return (${code})` : code;

        // ============================================================
        // BUILD ASYNC FUNCTION
        // ============================================================

        const fn = new AsyncFunction(
            'sock',
            'conn',
            'chat',
            'sender',
            'message',
            'quoted',
            'args',
            'ctx',
            'baileys',
            'generateWAMessageFromContent',
            'generateWAMessage',
            'generateWAMessageContent',
            'prepareWAMessageMedia',
            'downloadContentFromMessage',
            'proto',
            'DisconnectReason',
            `"use strict";\n${body}`
        );

        // ============================================================
        // JALANKAN
        // ============================================================

        let result;
        let error = null;

        try {
            result = await fn(
                sock,
                sock,
                chat,
                sender,
                message,
                quoted,
                args || [],
                ctx,
                baileys,
                baileys.generateWAMessageFromContent,
                baileys.generateWAMessage,
                baileys.generateWAMessageContent,
                baileys.prepareWAMessageMedia,
                baileys.downloadContentFromMessage,
                baileys.proto,
                baileys.DisconnectReason
            );
        } catch (e) {
            error = e;
        }

        // ============================================================
        // KIRIM HASIL
        // ============================================================

        let output;

        if (error) {
            output =
                `❌ *Eval Error*\n\n` +
                `${error.name}: ${error.message}\n\n` +
                `${(error.stack || '').split('\n').slice(0, 3).join('\n')}`;
            await react('❌');
        } else if (result === undefined) {
            output = `✅ *Executed*\n\n${code}`;
            await react('✅');
        } else {
            let resultStr;
            if (typeof result === 'string') {
                resultStr = result;
            } else {
                resultStr = util.inspect(result, {
                    depth: 3,
                    colors: false,
                    maxArrayLength: 50,
                    maxStringLength: 2000
                });
            }

            // Potong kalau kepanjangan (limit WA ~4000 char)
            if (resultStr.length > 3800) {
                resultStr = resultStr.slice(0, 3800) + '\n\n... (truncated)';
            }

            output = `📌 *Eval Result*\n━━━━━━━━━━━━━━━━━━━━\n\n${resultStr}`;
            await react('✅');
        }

        console.log('[EVAL] Output length:', output.length);

        // Kirim langsung lewat sock (bypass sendWithReply)
        try {
            await sock.sendMessage(chat, { text: output });
        } catch (e) {
            console.error('[EVAL] Send error:', e.message);
            // Fallback ke ctx.reply
            try { await reply(output); } catch {}
        }
    }
};