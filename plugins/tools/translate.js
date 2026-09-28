// command/tools/translate.js
// 🌍 Translate - Support semua bahasa + Untuk semua user

import axios from 'axios';

// ============================================================
// DAFTAR BAHASA YANG DIDUKUNG
// ============================================================

const LANGUAGES = {
    id: { name: 'Indonesia', emoji: '🇮🇩' },
    en: { name: 'English', emoji: '🇬🇧' },
    ja: { name: 'Japanese', emoji: '🇯🇵' },
    ko: { name: 'Korean', emoji: '🇰🇷' },
    zh: { name: 'Mandarin', emoji: '🇨🇳' },
    ar: { name: 'Arabic', emoji: '🇸🇦' },
    es: { name: 'Spanish', emoji: '🇪🇸' },
    fr: { name: 'French', emoji: '🇫🇷' },
    de: { name: 'German', emoji: '🇩🇪' },
    ru: { name: 'Russian', emoji: '🇷🇺' },
    it: { name: 'Italian', emoji: '🇮🇹' },
    pt: { name: 'Portuguese', emoji: '🇵🇹' },
    nl: { name: 'Dutch', emoji: '🇳🇱' },
    hi: { name: 'Hindi', emoji: '🇮🇳' },
    vi: { name: 'Vietnamese', emoji: '🇻🇳' },
    th: { name: 'Thai', emoji: '🇹🇭' },
    ms: { name: 'Malay', emoji: '🇲🇾' },
    fil: { name: 'Filipino', emoji: '🇵🇭' },
    km: { name: 'Khmer', emoji: '🇰🇭' },
    my: { name: 'Burmese', emoji: '🇲🇲' },
    ne: { name: 'Nepali', emoji: '🇳🇵' },
    si: { name: 'Sinhala', emoji: '🇱🇰' },
    ta: { name: 'Tamil', emoji: '🇮🇳' },
    te: { name: 'Telugu', emoji: '🇮🇳' },
    ur: { name: 'Urdu', emoji: '🇵🇰' },
    fa: { name: 'Persian', emoji: '🇮🇷' },
    tr: { name: 'Turkish', emoji: '🇹🇷' },
    pl: { name: 'Polish', emoji: '🇵🇱' },
    uk: { name: 'Ukrainian', emoji: '🇺🇦' },
    ro: { name: 'Romanian', emoji: '🇷🇴' },
    el: { name: 'Greek', emoji: '🇬🇷' },
    hu: { name: 'Hungarian', emoji: '🇭🇺' },
    cs: { name: 'Czech', emoji: '🇨🇿' },
    sv: { name: 'Swedish', emoji: '🇸🇪' },
    da: { name: 'Danish', emoji: '🇩🇰' },
    no: { name: 'Norwegian', emoji: '🇳🇴' },
    fi: { name: 'Finnish', emoji: '🇫🇮' },
    he: { name: 'Hebrew', emoji: '🇮🇱' },
    bn: { name: 'Bengali', emoji: '🇧🇩' },
    jv: { name: 'Javanese', emoji: '🇮🇩' },
    su: { name: 'Sundanese', emoji: '🇮🇩' },
};

// ============================================================
// SPLIT TEXT
// ============================================================

function splitTextIntoChunks(text, maxLength = 450) {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
}

// ============================================================
// TERJEMAHKAN SATU CHUNK
// ============================================================

async function translateChunk(text, targetLang, retries = 2) {
    try {
        const response = await axios.post(
            'https://api.mymemory.translated.net/get',
            null,
            {
                params: {
                    q: text,
                    langpair: `auto|${targetLang}`,
                    format: 'json'
                },
                timeout: 15000
            }
        );

        const data = response.data;

        if (data.responseStatus === 200 && data.responseData) {
            return {
                success: true,
                translated: data.responseData.translatedText,
                sourceLang: data.responseData.sourceLanguage || 'auto'
            };
        }

        return { success: false, error: data.responseDetails || 'Gagal' };

    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return translateChunk(text, targetLang, retries - 1);
        }
        return { success: false, error: error.message };
    }
}

// ============================================================
// GENERATE MENU
// ============================================================

function generateMenu() {
    const langList = Object.entries(LANGUAGES)
        .map(([code, lang]) => `• \`${code}\` ${lang.emoji} ${lang.name}`)
        .join('\n');

    return (
        `🌍 *Translate - Daftar Bahasa*\n\n` +
        `📌 *Kode → Bahasa*\n` +
        `${langList}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📌 *Cara Penggunaan:*\n` +
        `1. \`.tr <teks>\` → Terjemahkan ke Indonesia (default)\n` +
        `2. \`.tr <kode> <teks>\` → Terjemahkan ke bahasa tertentu\n` +
        `3. Reply pesan dengan \`.tr\` → Terjemahkan pesan\n\n` +
        `📌 *Contoh:*\n` +
        `.tr Hello world\n` +
        `.tr en Halo dunia\n` +
        `.tr ja こんにちは\n` +
        `.tr fr Comment ça va?\n\n` +
        `📌 *Reply:*\n` +
        `(reply ke pesan) .tr\n` +
        `(reply ke pesan) .tr en`
    );
}

// ============================================================
// COMMAND
// ============================================================

export default {
    name: 'translate',
    aliases: ['tr', 'terjemah', 'tl'],
    category: 'tools',
    description: '🌍 Translate text to any language',

    async execute(ctx) {
        const { sock, chat, sender, pushName, args, react, quoted, message } = ctx;
        await react('⏳');

        const botName = 'FarrMdV1';
        const userName = pushName || sender.split('@')[0] || 'User';

        // ============================================================
        // PARSE ARGUMEN
        // ============================================================

        let targetLang = 'id';
        let targetText = '';
        let argsArray = args || [];

        if (argsArray.length === 0 && !quoted) {
            await react('✅');
            return generateMenu();
        }

        const firstArg = argsArray[0]?.toLowerCase() || '';
        if (LANGUAGES[firstArg] && firstArg.length === 2) {
            targetLang = firstArg;
            argsArray = argsArray.slice(1);
        }

        if (argsArray.length > 0) {
            targetText = argsArray.join(' ');
        }

        if (!targetText && quoted && quoted.text) {
            targetText = quoted.text;
        }

        if (!targetText || targetText.length === 0) {
            await react('❌');
            return `🌍 *Translate*\n\n❌ Masukkan teks atau reply ke pesan!\n\n📌 Ketik .translate tanpa argumen untuk lihat cara penggunaan.`;
        }

        // ============================================================
        // FAKE QUOTED HEADER (MENGGUNAKAN PUSHNAME)
        // ============================================================

        const fakeQuotedMessage = {
            conversation: 
                `🌍 *TRANSLATE*\n` +
                `${botName} Translate Service`
        };

        const fakeStanzaId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        // ============================================================
        // SPLIT TEXT JIKA PANJANG
        // ============================================================

        const chunks = splitTextIntoChunks(targetText, 450);
        const totalChunks = chunks.length;

        // ============================================================
        // FUNGSI KIRIM HASIL
        // ============================================================

        async function sendTranslationResult(translated, sourceLang, targetLang, totalChunks) {
            const targetLangName = LANGUAGES[targetLang]?.name || targetLang.toUpperCase();
            const targetEmoji = LANGUAGES[targetLang]?.emoji || '🌍';
            const sourceLangName = LANGUAGES[sourceLang]?.name || sourceLang.toUpperCase();

            const header = 
                `🌍 *Translate ${targetEmoji}*\n\n` +
                `📌 *Dari:* ${sourceLangName}\n` +
                `📌 *Ke:* ${targetLangName}`;

            const footer = totalChunks > 1 ? `\n📌 *Bagian:* ${totalChunks} chunk` : '';

            const resultText = translated.length > 3800 
                ? translated.slice(0, 3600) + `\n\n... (${translated.length - 3600} karakter terpotong)`
                : translated;

            await sock.sendMessage(chat, {
                text: 
                    `${header}${footer}\n\n` +
                    `📝 *Hasil:*\n` +
                    `${resultText}`,
                contextInfo: {
                    quotedMessage: fakeQuotedMessage,
                    stanzaId: fakeStanzaId,
                    participant: sock.user.id,
                    remoteJid: chat,
                    isForwarded: true,
                    forwardingScore: 999,
                    mentionedJid: [sender],
                    // ✅ REPLY KE PESAN USER DENGAN PUSHNAME
                    quotedMessageId: message.key.id,
                    quotedMessage: {
                        conversation: `🌍 Translate request from ${userName}`
                    }
                },
                footer: `🌍 ${botName} • ${new Date().toLocaleTimeString('id-ID')}`
            });

            await react('✅');
        }

        // ============================================================
        // JIKA 1 CHUNK
        // ============================================================

        if (totalChunks === 1) {
            try {
                const result = await translateChunk(chunks[0], targetLang);
                if (!result.success) {
                    await react('❌');
                    return `❌ Gagal menerjemahkan: ${result.error}`;
                }

                await sendTranslationResult(
                    result.translated,
                    result.sourceLang,
                    targetLang,
                    1
                );

            } catch (error) {
                await react('❌');
                return `❌ Gagal menerjemahkan: ${error.message}`;
            }
            return;
        }

        // ============================================================
        // BANYAK CHUNK
        // ============================================================

        await react('⏳');
        await sock.sendMessage(chat, {
            text: `⏳ Menerjemahkan ${totalChunks} bagian teks panjang...\nMohon tunggu sebentar.`,
            contextInfo: {
                mentionedJid: [sender],
                quotedMessageId: message.key.id,
                quotedMessage: {
                    conversation: `🌍 Translate request from ${userName}`
                }
            }
        });

        let allTranslated = [];
        let sourceLangDetected = 'auto';

        for (let i = 0; i < chunks.length; i++) {
            const result = await translateChunk(chunks[i], targetLang);

            if (!result.success) {
                await react('❌');
                return `❌ Gagal menerjemahkan bagian ${i + 1}: ${result.error}`;
            }

            allTranslated.push(result.translated);
            if (result.sourceLang && sourceLangDetected === 'auto') {
                sourceLangDetected = result.sourceLang;
            }
        }

        const finalText = allTranslated.join(' ');
        await sendTranslationResult(
            finalText,
            sourceLangDetected,
            targetLang,
            totalChunks
        );
    }
};