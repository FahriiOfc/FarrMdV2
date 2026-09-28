// plugins/owner/run.js
// 🚀 Execute generated .js file (vm module, bukan import)

import vm from 'vm';
import fs from 'fs/promises';
import crypto from 'crypto';

export default {
    name: 'run',
    aliases: ['exec'],
    category: 'owner',
    description: '🚀 Execute raw payload code',
    ownerOnly: true,

    async execute(ctx) {
        const { sock, chat, quoted, react, message } = ctx;

        await react('⏳');

        if (!quoted?.message?.documentMessage) {
            await react('❌');
            return '❌ Reply ke file `.js`.';
        }

        try {
            const { downloadMediaMessage, generateWAMessageFromContent } = await import('@chaeulso/baileys');

            // ============================================================
            // DOWNLOAD FILE
            // ============================================================

            const buffer = await downloadMediaMessage(
                { key: quoted.key, message: quoted.message },
                'buffer',
                {},
                { logger: console, reuploadRequest: sock.updateMediaMessage }
            );

            if (!buffer?.length) {
                await react('❌');
                return '❌ Gagal download file.';
            }

            const code = buffer.toString('utf8');

            console.log('[RUN] Code length:', code.length);

            // ============================================================
            // SIAPKAN KONTEKS UNTUK VM
            // ============================================================

            const context = {
                m: {
                    chat: chat,
                    key: message.key,
                    message: message.message,
                    sender: message.key.participant || message.key.remoteJid,
                    reply: async (text) => {
                        await sock.sendMessage(chat, { text: String(text) });
                    }
                },
                WaSocket: sock,
                sock: sock,
                generateWAMessageFromContent,
                console,
                Buffer,
                crypto,
                setTimeout,
                clearTimeout
            };

            // ============================================================
            // EXECUTE VIA VM
            // ============================================================

            try {
                // Wrap dalam async function karena code pakai `await`
                const wrappedCode = `(async () => {
${code}
})()`;

                const asyncScript = new vm.Script(wrappedCode, {
                    filename: `farr_run_${Date.now()}.js`
                });

                const vmContext = vm.createContext(context);
                await asyncScript.runInContext(vmContext);

                console.log('[RUN] ✅ Executed successfully');
                await react('✅');

            } catch (execError) {
                console.error('[RUN] ❌ Execute error:', execError.message);
                console.error('[RUN] Stack:', execError.stack?.split('\n').slice(0, 5).join('\n'));
                await react('❌');
                return `❌ Execute error: ${execError.message}`;
            }

        } catch (error) {
            console.error('[RUN] Error:', error);
            await react('❌');
            return `❌ ${error.message}`;
        }
    }
};