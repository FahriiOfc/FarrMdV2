// plugins/game/ttt.js
// Tic Tac Toe - 2 Mode (vs AI & 1v1)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════════════════════════
// SESSION STORAGE
// ════════════════════════════════════════════════════════════
global.tttSessions = global.tttSessions || new Map();

// ════════════════════════════════════════════════════════════
// HTML UNTUK VS AI
// ════════════════════════════════════════════════════════════
const HTML_AI = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: #111b21; color: #e9edef; padding: 20px; }
h2 { color: #00a884; margin-bottom: 15px; text-align: center; }
.status { text-align: center; margin: 15px 0; font-size: 16px; font-weight: bold; }
.board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 300px; margin: 0 auto; }
.cell { aspect-ratio: 1; background: #202c33; border: none; border-radius: 8px; font-size: 48px; font-weight: bold; color: #e9edef; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.cell:active { background: #2a3942; }
.cell.x { color: #e9edef; }
.cell.o { color: #00a884; }
.cell.win { background: #005c4b; }
.levels { display: flex; gap: 8px; justify-content: center; margin: 20px 0; }
.level { padding: 8px 16px; background: #202c33; border: 1px solid #374248; color: #aebac1; border-radius: 20px; cursor: pointer; font-size: 13px; }
.level.active { background: #00a884; color: #111b21; border-color: #00a884; }
.reset { display: block; margin: 20px auto; padding: 12px 24px; background: #00a884; border: none; color: #111b21; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; }
.score { display: flex; justify-content: center; gap: 20px; margin-top: 15px; font-size: 14px; }
</style>
</head>
<body>
<h2>🎮 Tic Tac Toe (vs AI)</h2>
<div class="status" id="status">Giliranmu (X)</div>
<div class="board" id="board"></div>
<div class="levels" id="levels"></div>
<button class="reset" onclick="reset()">🔄 Ulang</button>
<div class="score">
<span>Kamu: <b id="sx">0</b></span>
<span>Seri: <b id="sd">0</b></span>
<span>AI: <b id="so">0</b></span>
</div>

<script>
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const LEVELS = ['Easy','Medium','Hard'];
let board = Array(9).fill(null);
let turn = 'X';
let over = false;
let level = 1;
let scores = { X:0, O:0, D:0 };

function render() {
    const el = document.getElementById('board');
    el.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'cell';
        if (board[i] === 'X') { btn.classList.add('x'); btn.textContent = 'X'; }
        if (board[i] === 'O') { btn.classList.add('o'); btn.textContent = 'O'; }
        btn.onclick = () => play(i);
        el.appendChild(btn);
    }
    const st = document.getElementById('status');
    if (over) {
        const w = checkWin();
        if (w === 'X') st.textContent = '🏆 Kamu menang!';
        else if (w === 'O') st.textContent = '💀 AI menang!';
        else st.textContent = '🤝 Seri!';
    } else {
        st.textContent = turn === 'X' ? 'Giliranmu (X)' : 'AI berpikir...';
    }
    document.getElementById('sx').textContent = scores.X;
    document.getElementById('so').textContent = scores.O;
    document.getElementById('sd').textContent = scores.D;
}

function play(i) {
    if (over || board[i] || turn !== 'X') return;
    board[i] = 'X';
    render();
    if (checkWin() || board.every(c => c)) return finish();
    turn = 'O';
    render();
    setTimeout(aiMove, 400);
}

function aiMove() {
    let move;
    const empty = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    if (!empty.length) return finish();
    
    if (level === 0) {
        move = empty[Math.floor(Math.random() * empty.length)];
    } else if (level === 1) {
        move = findWin('O');
        if (move === null) move = findWin('X');
        if (move === null && !board[4]) move = 4;
        if (move === null) move = empty[Math.floor(Math.random() * empty.length)];
    } else {
        move = minimax(board, 'O').index;
    }
    
    board[move] = 'O';
    render();
    if (checkWin() || board.every(c => c)) return finish();
    turn = 'X';
    render();
}

function findWin(p) {
    for (const [a,b,c] of WINS) {
        const line = [board[a], board[b], board[c]];
        if (line.filter(v => v === p).length === 2 && line.includes(null)) {
            return [a,b,c][line.indexOf(null)];
        }
    }
    return null;
}

function minimax(b, player) {
    const empty = b.map((v,i) => v ? -1 : i).filter(i => i >= 0);
    if (checkWinOn(b) === 'X') return { score: -10 };
    if (checkWinOn(b) === 'O') return { score: 10 };
    if (!empty.length) return { score: 0 };
    
    const moves = [];
    for (const i of empty) {
        b[i] = player;
        const r = minimax(b, player === 'O' ? 'X' : 'O');
        moves.push({ index: i, score: r.score });
        b[i] = null;
    }
    
    if (player === 'O') {
        return moves.reduce((a, b) => a.score > b.score ? a : b);
    } else {
        return moves.reduce((a, b) => a.score < b.score ? a : b);
    }
}

function checkWinOn(b) {
    for (const [a,b1,c] of WINS) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
}

function checkWin() { return checkWinOn(board); }

function finish() {
    over = true;
    const w = checkWin();
    if (w === 'X') scores.X++;
    else if (w === 'O') scores.O++;
    else scores.D++;
    render();
}

function reset() {
    board = Array(9).fill(null);
    turn = 'X';
    over = false;
    render();
}

function buildLevels() {
    const el = document.getElementById('levels');
    el.innerHTML = '';
    LEVELS.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.className = 'level' + (i === level ? ' active' : '');
        btn.textContent = name;
        btn.onclick = () => { level = i; buildLevels(); reset(); };
        el.appendChild(btn);
    });
}

buildLevels();
render();
</script>
</body>
</html>`;

// ════════════════════════════════════════════════════════════
// UTILITY
// ════════════════════════════════════════════════════════════
function renderBoardText(board) {
    const symbols = board.map(c => c === 'X' ? '❌' : c === 'O' ? '⭕' : '⬜');
    return `${symbols[0]} ${symbols[1]} ${symbols[2]}\n${symbols[3]} ${symbols[4]} ${symbols[5]}\n${symbols[6]} ${symbols[7]} ${symbols[8]}`;
}

function checkWin(board) {
    const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of WINS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(c => c)) return 'D';
    return null;
}

// ════════════════════════════════════════════════════════════
// SEND RICH MESSAGE (vs AI)
// ════════════════════════════════════════════════════════════
async function sendRichAI(conn, jid) {
    const responseId = `ttt_ai_${Date.now()}`;
    const data = {
        response_id: responseId,
        sections: [{
            view_model: {
                primitive: {
                    __typename: "GenAIaeacdsnwHtmlPrimitive",
                    payload: HTML_AI,
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
                    botResponseId: responseId
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [{ messageType: 2, messageText: "🎮 Tic Tac Toe vs AI" }],
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

// ════════════════════════════════════════════════════════════
// SEND MENU MODE
// ════════════════════════════════════════════════════════════
async function sendMenu(conn, jid, m) {
    await conn.sendMessage(jid, {
        text: `🎮 *TIC TAC TOE*\n\nPilih mode permainan:`,
        footer: 'FarrMdV2',
        buttons: [
            {
                buttonId: 'ttt_ai',
                buttonText: { displayText: '🤖 vs AI' },
                type: 1
            },
            {
                buttonId: 'ttt_pvp',
                buttonText: { displayText: '👥 1 vs 1' },
                type: 1
            }
        ],
        headerType: 1
    }, { quoted: m });
}

// ════════════════════════════════════════════════════════════
// SEND LOBBY 1v1
// ════════════════════════════════════════════════════════════
async function sendLobby(conn, jid, m) {
    const session = {
        type: 'pvp',
        state: 'lobby',
        players: [{
            id: m.sender,
            name: m.pushName || 'Player 1',
            symbol: 'X'
        }],
        board: Array(9).fill(null),
        turn: 0,
        createdAt: Date.now()
    };
    
    global.tttSessions.set(jid, session);
    
    const lobbyMsg = await conn.sendMessage(jid, {
        text: `📢 *LOBBY TIC TAC TOE*\n\n👤 Pemain 1: ${m.pushName || 'Player 1'}\n👥 Pemain: 1/2\n\nMenunggu pemain kedua...`,
        footer: 'Klik JOIN untuk bergabung',
        buttons: [
            {
                buttonId: 'ttt_join',
                buttonText: { displayText: '✅ JOIN' },
                type: 1
            },
            {
                buttonId: 'ttt_cancel',
                buttonText: { displayText: '❌ BATAL' },
                type: 1
            }
        ],
        headerType: 1
    }, { quoted: m });
    
    session.lobbyMsgKey = lobbyMsg.key;
}

// ════════════════════════════════════════════════════════════
// SEND GAME BOARD (1v1)
// ════════════════════════════════════════════════════════════
async function sendGameBoard(conn, jid, session) {
    const currentPlayer = session.players[session.turn];
    const boardText = renderBoardText(session.board);
    
    // Tombol untuk kotak kosong
    const buttons = [];
    for (let i = 0; i < 9; i++) {
        if (session.board[i] === null) {
            buttons.push({
                buttonId: `ttt_move_${i}`,
                buttonText: { displayText: `${i + 1}` },
                type: 1
            });
        }
    }
    
    const text = `🎮 *TIC TAC TOE - 1v1*\n\n${boardText}\n\n👤 Giliran: *${currentPlayer.name}* (${currentPlayer.symbol})\n\nPilih kotak kosong:`;
    
    // Kirim tombol dalam batch (max 3)
    const batches = [];
    for (let i = 0; i < buttons.length; i += 3) {
        batches.push(buttons.slice(i, i + 3));
    }
    
    for (let b = 0; b < batches.length; b++) {
        await conn.sendMessage(jid, {
            text: b === 0 ? text : `Pilih kotak lainnya:`,
            footer: 'FarrMdV2',
            buttons: batches[b],
            headerType: 1
        });
    }
    
    if (buttons.length === 0) {
        await conn.sendMessage(jid, { text: 'Game selesai!' });
    }
}

// ════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════
let handler = async (m, { conn, args, command }) => {
    // Handle button responses
    const btnId = m.message?.buttonsResponseMessage?.selectedButtonId
        || m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
    
    // Kalau ini button response
    if (btnId) {
        let id = btnId;
        try {
            const parsed = JSON.parse(btnId);
            id = parsed.id;
        } catch {}
        
        // JOIN
        if (id === 'ttt_join') {
            const session = global.tttSessions.get(m.chat);
            if (!session || session.state !== 'lobby') return;
            
            // Cek sudah join?
            if (session.players.find(p => p.id === m.sender)) {
                return conn.sendMessage(m.chat, { text: '⚠️ Kamu sudah join!' }, { quoted: m });
            }
            
            // Tambah pemain
            session.players.push({
                id: m.sender,
                name: m.pushName || 'Player 2',
                symbol: 'O'
            });
            
            if (session.players.length === 2) {
                session.state = 'playing';
                session.turn = 0;
                
                await conn.sendMessage(m.chat, {
                    text: `🎮 *GAME DIMULAI!*\n\n👤 ${session.players[0].name} (X)\n👤 ${session.players[1].name} (O)`
                });
                
                await sendGameBoard(conn, m.chat, session);
            }
            return;
        }
        
        // CANCEL
        if (id === 'ttt_cancel') {
            global.tttSessions.delete(m.chat);
            return conn.sendMessage(m.chat, { text: '❌ Lobby dibatalkan' }, { quoted: m });
        }
        
        // MOVE
        if (id.startsWith('ttt_move_')) {
            const idx = parseInt(id.replace('ttt_move_', ''));
            const session = global.tttSessions.get(m.chat);
            
            if (!session || session.state !== 'playing') return;
            
            const currentPlayer = session.players[session.turn];
            
            // Cek giliran
            if (currentPlayer.id !== m.sender) {
                return conn.sendMessage(m.chat, {
                    text: `⏳ Bukan giliranmu! Giliran: ${currentPlayer.name}`
                }, { quoted: m });
            }
            
            // Cek kotak kosong
            if (session.board[idx] !== null) {
                return conn.sendMessage(m.chat, { text: '⚠️ Kotak sudah terisi!' }, { quoted: m });
            }
            
            // Update board
            session.board[idx] = currentPlayer.symbol;
            
            // Cek menang
            const winner = checkWin(session.board);
            if (winner) {
                const boardText = renderBoardText(session.board);
                let result = '';
                if (winner === 'D') {
                    result = '🤝 *SERI!*';
                } else {
                    const winPlayer = session.players.find(p => p.symbol === winner);
                    result = `🏆 *${winPlayer.name} MENANG!*`;
                }
                
                await conn.sendMessage(m.chat, {
                    text: `🎮 *GAME SELESAI*\n\n${boardText}\n\n${result}`
                });
                
                global.tttSessions.delete(m.chat);
                return;
            }
            
            // Ganti giliran
            session.turn = (session.turn + 1) % 2;
            
            // Kirim board baru
            await sendGameBoard(conn, m.chat, session);
            return;
        }
        
        // AI MODE
        if (id === 'ttt_ai') {
            await sendRichAI(conn, m.chat);
            return;
        }
        
        // PVP MODE
        if (id === 'ttt_pvp') {
            await sendLobby(conn, m.chat, m);
            return;
        }
    }
    
    // Handle command .ttt
    if (command === 'ttt' || command === 'tictactoe') {
        global.tttSessions.delete(m.chat);
        await sendMenu(conn, m.chat, m);
    }
};

handler.command = ['ttt', 'tictactoe', 'sodor'];
handler.ownerOnly = false;
handler.premium = false;
handler.group = false;
handler.admin = false;

export default handler;
