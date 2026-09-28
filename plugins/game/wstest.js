// plugins/game/wstest.js
// Test WebSocket via Rich Message (Format embedded_screens)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const WS_URL = config.tunnelUrl ? config.tunnelUrl.replace('https://', 'wss://') : 'wss://localhost';

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body { font-family: monospace; padding: 20px; background: #111; color: #eee; margin: 0; }
h2 { color: #0af; }
#log { background: #000; color: #0f0; padding: 10px; height: 300px; overflow-y: auto; border: 1px solid #333; border-radius: 8px; }
input, button { padding: 10px; margin: 5px 0; font-family: monospace; border-radius: 6px; border: none; }
input { width: 70%; background: #222; color: #eee; border: 1px solid #444; }
button { background: #0a84ff; color: #fff; cursor: pointer; padding: 10px 20px; }
button:hover { background: #0066cc; }
.status { padding: 8px; border-radius: 6px; margin-bottom: 10px; font-weight: bold; }
.off { background: #300; color: #f88; }
.on { background: #030; color: #8f8; }
</style>
</head>
<body>
<h2>🔌 WebSocket Test</h2>
<div id="status" class="status off">⚪ Disconnected</div>
<div>
<input id="roomInput" value="wa_test_123" placeholder="Room ID">
<button onclick="connect()">Connect</button>
</div>
<div>
<input id="msgInput" value="hello from WhatsApp!">
<button onclick="send()">Send</button>
</div>
<div id="log"></div>

<script>
let ws = null;
const log = document.getElementById('log');
const status = document.getElementById('status');

function addLog(text, color = '#0f0') {
    const div = document.createElement('div');
    div.style.color = color;
    div.textContent = '[' + new Date().toLocaleTimeString() + '] ' + text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function connect() {
    const roomId = document.getElementById('roomInput').value;
    const url = '${WS_URL}/ws?session=' + roomId;
    addLog('Connecting to ' + url + '...', '#ff0');
    
    try {
        ws = new WebSocket(url);
        
        ws.onopen = () => {
            addLog('✅ Connected!');
            status.textContent = '🟢 Connected';
            status.className = 'status on';
        };
        ws.onmessage = (e) => addLog('📩 ' + e.data);
        ws.onerror = (e) => addLog('❌ WebSocket Error', '#f00');
        ws.onclose = () => {
            addLog('🔌 Disconnected', '#f80');
            status.textContent = '⚪ Disconnected';
            status.className = 'status off';
        };
    } catch (e) {
        addLog('❌ Exception: ' + e.message, '#f00');
    }
}

function send() {
    if (!ws || ws.readyState !== 1) {
        return addLog('❌ Not connected', '#f00');
    }
    const msg = document.getElementById('msgInput').value;
    ws.send(JSON.stringify({
        type: 'action',
        userId: '628xxx',
        payload: { message: msg, time: Date.now() }
    }));
    addLog('📤 Sent: ' + msg, '#0af');
}

setTimeout(connect, 500);
</script>
</body>
</html>`;

// ════════════════════════════════════════════════════════════
// ✅ SEND RICH MESSAGE - FORMAT embedded_screens
// ════════════════════════════════════════════════════════════
async function sendRichTest(conn, jid) {
    const responseId = `wstest_${Date.now()}`;
    
    const data = {
        response_id: responseId,
        sections: [
            {
                __typename: "GenAIUnifiedResponseSection",
                view_model: {
                    __typename: "GenAISingleLayoutViewModel",
                    primitive: {
                        __typename: "GenAIBotProgressStatusPrimitive",
                        title: "WebSocket Test: *Click Me*",
                        is_in_progress: true
                    }
                }
            }
        ],
        embedded_screens: [
            {
                title: "WebSocket Test",
                content: [
                    {
                        __typename: "FOAIDNixelButtonSheets",
                        tabs: [
                            {
                                id: "tab_0",
                                tab_header: "Test",
                                sections: [
                                    {
                                        __typename: "GenAIUnifiedResponseSection",
                                        view_model: {
                                            __typename: "GenAISingleLayoutViewModel",
                                            primitive: {
                                                __typename: "GenAIaeacdsnwHtmlPrimitive",
                                                payload: HTML,
                                                url: "https://example.com",
                                                trusted_sources: ["example.com"]
                                            }
                                        }
                                    }
                                ],
                                step_entries: []
                            }
                        ]
                    }
                ]
            }
        ]
    };

    await conn.relayMessage(
        jid,
        {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: "",
                    botResponseId: responseId,
                    richResponseSourcesMetadata: {}
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify(data)).toString('base64')
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: { botJid: "0@bot" },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        },
        {
            messageId: responseId
        }
    );
}

// ════════════════════════════════════════════════════════════
// ✅ HANDLER
// ════════════════════════════════════════════════════════════
let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, {
            react: { text: '🔌', key: m.key }
        });
    } catch (_) {}

    try {
        await sendRichTest(conn, m.chat);
        try {
            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });
        } catch (_) {}
    } catch (error) {
        console.error('[WSTEST ERROR]', error);
        try {
            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
        } catch (_) {}
        return conn.sendMessage(m.chat, {
            text: `❌ Gagal: ${error.message}`
        }, { quoted: m });
    }
};

handler.command = ['wstest', 'testws'];
handler.ownerOnly = false;
handler.premium = false;
handler.group = false;
handler.admin = false;

export default handler;
