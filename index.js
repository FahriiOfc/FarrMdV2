// index.js
// FarrMdV2 - Entry Point
// Merged: index.js + lib/connection.js
// Custom pairing code: FARRMDV2

import readline from 'readline';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Boom } from '@hapi/boom';
import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion
} from '@chaeulso/baileys';

import config from './config.js';
import CommandLoader from './lib/commandLoader.js';
import Handler from './handler.js';
import identity from './lib/identity.js';
import crmstore from './lib/crmstore.js';   // ← GANTI dari makeInMemoryStore

// ============================================================
// CONSTANT
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = __dirname;

const PAIRING_CODE = 'FARRMDV2';
const SESSION_PATH = path.join(PROJECT_ROOT, config.sessionName || 'auth');
const logger = pino({ level: 'silent' });

// ============================================================
// GLOBAL SETUP — CRMSTORE
// ============================================================

global.MESSAGE_CACHE_LIMIT = 50000;      // ← batas cache pesan
global.crmstore = crmstore;

// ============================================================
// STATE
// ============================================================

let sock = null;
let saveCreds = null;
let commandHandler = null;
let reconnectTimer = null;
let isConnecting = false;
let isShuttingDown = false;
let reconnectAttempts = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// ============================================================
// HELPERS
// ============================================================

function ts() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `[${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
}

function log(msg) {
    console.log(`${ts()} ${msg}`);
}

function normalizePhone(number) {
    return String(number || '')
        .replace(/\D/g, '')
        .replace(/^0+/, '');
}

function hasSession() {
    return fs.existsSync(path.join(SESSION_PATH, 'creds.json'));
}

function ensureSessionDir() {
    if (!fs.existsSync(SESSION_PATH)) {
        fs.mkdirSync(SESSION_PATH, { recursive: true });
    }
}

function getStatusCode(lastDisconnect) {
    try {
        if (!lastDisconnect?.error) return 0;
        return Boom.isBoom(lastDisconnect.error)
            ? lastDisconnect.error.output.statusCode
            : lastDisconnect.error?.output?.statusCode || 0;
    } catch {
        return 0;
    }
}

// ============================================================
// MESSAGE HANDLER ATTACH
// ============================================================

let messageListener = null;

function attachMessageHandler() {
    if (!sock) return;

    if (messageListener) {
        try { sock.ev.off('messages.upsert', messageListener); } catch {}
    }

    messageListener = async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const message of messages) {
            try {
                await commandHandler?.handleMessage(message);
            } catch (error) {
                console.error('[HANDLER ERROR]', error.message);
            }
        }
    };

    sock.ev.on('messages.upsert', messageListener);
}

// ============================================================
// RECONNECT
// ============================================================

function scheduleReconnect(delay) {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (isShuttingDown) return;
        startConnection();
    }, delay);
}

// ============================================================
// START CONNECTION
// ============================================================

async function startConnection() {
    if (isShuttingDown) return;
    if (isConnecting) return;

    isConnecting = true;
    ensureSessionDir();

    try {
        if (sock) {
            try { sock.ev.removeAllListeners(); } catch {}
            try { sock.ws?.close?.(); } catch {}
            sock = null;
        }

        const { state, saveCreds: save } = await useMultiFileAuthState(SESSION_PATH);
        saveCreds = save;

        let version = null;
        try {
            const result = await fetchLatestBaileysVersion();
            version = result.version;
        } catch {}

        const socketConfig = {
            auth: state,
            logger,
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: false,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false
        };

        if (version) socketConfig.version = version;

        sock = makeWASocket(socketConfig);
        sock.ev.on('creds.update', saveCreds);

        // ============================================================
        // ✅ CRMSTORE BIND (ganti dari initStore)
        // ============================================================

        try {
            crmstore.bind(sock);
            log('[CRM] CRMStore bound to socket');
        } catch (e) {
            console.error('[CRM] Bind error:', e.message);
        }

        // ============================================================
        // PAIRING
        // ============================================================

        if (!state.creds.registered) {
            console.log('');
            console.log('====================================');
            console.log('       FARRMD V2 - PAIRING');
            console.log('====================================');
            console.log('');

            const input = await question('Masukkan nomor WhatsApp (contoh: 628xxxxxxxxxx): ');
            const phoneNumber = normalizePhone(input);

            if (!phoneNumber || phoneNumber.length < 8) {
                console.log('[PAIRING] Nomor tidak valid.');
                rl.close();
                process.exit(1);
            }

            try {
                const code = await sock.requestPairingCode(phoneNumber, PAIRING_CODE);

                console.log('');
                console.log('====================================');
                console.log('          PAIRING CODE');
                console.log('====================================');
                console.log('');
                console.log(`   ${code}`);
                console.log('');
                console.log('Masukkan kode di WhatsApp > Perangkat Tertaut.');
                console.log('');
            } catch (error) {
                console.log(`[PAIRING ERROR] ${error.message}`);
                rl.close();
                process.exit(1);
            } finally {
                rl.close();
            }
        }

        // ============================================================
        // CONNECTION UPDATE
        // ============================================================

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'connecting') {
                log('[SYSTEM] Menghubungkan ke WhatsApp...');
            }

            if (connection === 'open') {
                isConnecting = false;
                reconnectAttempts = 0;

                const botJid = sock?.user?.id || '';
                if (botJid) {
                    identity.setBotJid(botJid);
                }

                global.sock = sock;
                attachMessageHandler();

                log('[SYSTEM] WhatsApp connected');
                log(`[SYSTEM] Bot JID: ${botJid}`);
                log('[SYSTEM] Bot siap menerima pesan.');
            }

            if (connection === 'close') {
                isConnecting = false;
                if (isShuttingDown) return;

                const statusCode = getStatusCode(lastDisconnect);
                const errorMsg = lastDisconnect?.error?.message || '';

                if (statusCode === DisconnectReason.loggedOut) {
                    log('[SESSION] WhatsApp logout. Hapus folder auth/ dan restart.');
                    return;
                }

                if (statusCode === DisconnectReason.connectionReplaced) {
                    log('[SYSTEM] Koneksi digantikan. Tidak reconnect.');
                    return;
                }

                if (config.reconnect?.enabled !== true) {
                    log('[SYSTEM] Reconnect dinonaktifkan.');
                    return;
                }

                const maxAttempts = Number(config.reconnect?.maxAttempts || 5);
                if (reconnectAttempts >= maxAttempts) {
                    log(`[RECONNECT] Batas tercapai (${maxAttempts}x).`);
                    return;
                }

                let delay = Number(config.reconnect?.delay || 5000);
                if (errorMsg.includes('Stream Errored')) {
                    delay = 15000;
                } else if (statusCode === DisconnectReason.connectionLost || statusCode === 0) {
                    delay = 8000;
                }

                reconnectAttempts++;
                log(`[RECONNECT] ${reconnectAttempts}/${maxAttempts} dalam ${delay / 1000}s`);

                scheduleReconnect(delay);
            }
        });

        // ============================================================
        // KEEP ALIVE
        // ============================================================

        setInterval(() => {
            if (sock?.user && sock?.ws?.readyState === 1) {
                sock.sendPresenceUpdate('available').catch(() => {});
            }
        }, 60000);

        return sock;

    } catch (error) {
        isConnecting = false;
        log(`[START ERROR] ${error.message}`);
        if (!reconnectTimer) {
            scheduleReconnect(10000);
        }
    }
}

// ============================================================
// SHUTDOWN
// ============================================================

async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    log(`[${signal}] Menghentikan bot...`);

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    try {
        if (sock) {
            try { sock.ev.removeAllListeners(); } catch {}
            try { sock.end(undefined); } catch {}
        }
    } catch {}

    log('[SYSTEM] Bot dihentikan.');
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ============================================================
// MAIN
// ============================================================

async function main() {
    try {
        console.log('');
        console.log('====================================');
        console.log('       FARRMD V2');
        console.log('       ESM ARCHITECTURE');
        console.log('====================================');
        console.log('');

        // 1. Load commands
        const commandLoader = new CommandLoader();
        await commandLoader.scanCommands();
        global.commandLoader = commandLoader;

        // 2. Buat handler
        commandHandler = new Handler(commandLoader);

        // 3. Connect
        await startConnection();

    } catch (error) {
        console.error('[FATAL ERROR]', error);
        process.exit(1);
    }
}

main();
