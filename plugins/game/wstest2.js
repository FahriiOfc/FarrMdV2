// plugins/game/wstest2.js
// Test HTML statis di Rich Message

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial; padding: 20px; background: #111; color: #eee; }
h1 { color: #0af; }
.box { background: #222; padding: 15px; border-radius: 8px; margin: 10px 0; }
.test { padding: 10px; background: #333; margin: 5px 0; border-radius: 4px; }
.ok { color: #0f0; }
.fail { color: #f00; }
</style>
</head>
<body>
<h1>🧪 HTML Static Test</h1>

<div class="box">
  <div class="test">1. HTML Render: <span id="r1" class="ok">✅ OK</span></div>
  <div class="test">2. JavaScript: <span id="r2">⏳ Running...</span></div>
  <div class="test">3. HTTPS Image: <span id="r3">⏳ Loading...</span></div>
  <div class="test">4. Fetch API: <span id="r4">⏳ Testing...</span></div>
  <div class="test">5. WebSocket: <span id="r5">⏳ Testing...</span></div>
</div>

<img id="img" src="https://via.placeholder.com/50" style="display:none" />

<script>
// Test 2: JavaScript
document.getElementById('r2').textContent = '✅ OK';
document.getElementById('r2').className = 'ok';

// Test 3: HTTPS Image
const img = document.getElementById('img');
img.onload = () => {
  document.getElementById('r3').textContent = '✅ OK';
  document.getElementById('r3').className = 'ok';
};
img.onerror = () => {
  document.getElementById('r3').textContent = '❌ Gagal';
  document.getElementById('r3').className = 'fail';
};

// Test 4: Fetch API
fetch('https://wants-characterization-deployment-daughters.trycloudflare.com/')
  .then(r => r.json())
  .then(d => {
    document.getElementById('r4').textContent = '✅ OK - ' + JSON.stringify(d);
    document.getElementById('r4').className = 'ok';
  })
  .catch(e => {
    document.getElementById('r4').textContent = '❌ ' + e.message;
    document.getElementById('r4').className = 'fail';
  });

// Test 5: WebSocket
try {
  const ws = new WebSocket('wss://wants-characterization-deployment-daughters.trycloudflare.com/richtest');
  ws.onopen = () => {
    document.getElementById('r5').textContent = '✅ WebSocket OK';
    document.getElementById('r5').className = 'ok';
  };
  ws.onerror = () => {
    document.getElementById('r5').textContent = '❌ WebSocket Error';
    document.getElementById('r5').className = 'fail';
  };
  setTimeout(() => {
    if (ws.readyState !== 1) {
      document.getElementById('r5').textContent = '❌ WebSocket Timeout';
      document.getElementById('r5').className = 'fail';
    }
  }, 5000);
} catch (e) {
  document.getElementById('r5').textContent = '❌ ' + e.message;
  document.getElementById('r5').className = 'fail';
}
</script>
</body>
</html>`;

async function sendRichTest(conn, jid) {
    const data = {
        response_id: `wstest2_${Date.now()}`,
        sections: [{
            view_model: {
                primitive: {
                    __typename: "GenAIaeacdsnwHtmlPrimitive",
                    payload: HTML,
                    trusted_sources: []
                },
                __typename: "GenAISingleLayoutViewModel"
            }
        }]
    };

    await conn.relayMessage(
        jid,
        {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: "",
                    botResponseId: `wstest2_${Date.now()}`
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            { messageType: 2, messageText: "🧪 HTML Test" }
                        ],
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify(data)).toString('base64')
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardOrigin: 4
                        }
                    }
                }
            }
        },
        {}
    );
}

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, {
            react: { text: '🧪', key: m.key }
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
        console.error('[TEST2 ERROR]', error);
        try {
            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
        } catch (_) {}
    }
};

handler.command = ['wstest2', 'test2'];
export default handler;
