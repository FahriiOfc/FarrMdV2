// plugins/game/catur.js
// ♟️ CHESS MASTER - Multi-Level AI Chess dengan Rich Message

import config from '../../config.json' with { type: 'json' };

// ════════════════════════════════════════════════════════════
// ✅ HTML PAYLOAD (PRO CHESS + AI LOGIC)
// ════════════════════════════════════════════════════════════
const HTML_PAYLOAD = `
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        touch-action: none;
    }

    .card {
        width: 100%;
        max-width: 500px;
        margin: auto;
        background: linear-gradient(145deg, #1f1814, #120e0a);
        border: 2px solid #5a4030;
        border-radius: 18px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #e8dcc8;
    }

    .header-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0,0,0,0.25);
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid rgba(180,140,100,0.1);
    }

    .title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 1.5px;
        background: linear-gradient(135deg, #f5e6c8, #d4a853);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .status-turn {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: bold;
        color: #b09888;
    }
    .indicator {
        width: 10px; height: 10px; border-radius: 50%;
        background: #e8dcc8;
        position: relative;
    }
    .indicator.is-ai { background: #2a1f18; border: 1px solid #777; }
    .indicator.is-thinking::after {
        content: ''; position: absolute; inset: -4px;
        border-radius: 50%; border: 1.5px solid #d4a853;
        animation: ring 1.1s ease-out infinite;
    }
    @keyframes ring {
        0% { transform: scale(0.6); opacity: 1; }
        100% { transform: scale(2.2); opacity: 0; }
    }

    .levels {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
    }
    .levels::-webkit-scrollbar { display: none; }
    .level-btn {
        background: transparent;
        border: 1px solid #5a4030;
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 11px;
        font-weight: 600;
        color: #a08070;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
    }
    .level-btn.active {
        background: #d4a853;
        border-color: #d4a853;
        color: #120e0a;
    }

    #board-wrapper {
        width: 100%;
        padding-top: 100%;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 3px solid #3d281c;
        box-shadow: 0 5px 20px rgba(0,0,0,0.7);
    }

    #board {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(8, 1fr);
    }

    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: clamp(24px, 8vw, 42px);
        cursor: pointer;
        position: relative;
    }
    .cell.light { background: #dcb386; }
    .cell.dark { background: #8b5a2b; }
    .cell.selected { background: #7fb069 !important; }
    .cell.last-move { background: rgba(255, 220, 100, 0.4) !important; }

    .move-dot {
        position: absolute;
        width: 14px; height: 14px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 50%;
        pointer-events: none;
    }
    .capture-dot {
        position: absolute;
        width: 85%; height: 85%;
        border: 4px solid rgba(200, 50, 50, 0.5);
        border-radius: 50%;
        pointer-events: none;
    }

    .cell .piece {
        line-height: 1; pointer-events: none;
        filter: drop-shadow(0 3px 3px rgba(0,0,0,0.6));
    }

    .control-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0,0,0,0.2);
        padding: 8px 12px;
        border-radius: 10px;
    }

    .btn-group { display: flex; gap: 8px; }
    .btn-action {
        background: #2a1f18;
        border: 1px solid #5a4030;
        border-radius: 8px;
        color: #e8dcc8;
        padding: 8px 14px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
    }
    .btn-action:active { background: #5a4030; }

    .footer-log {
        font-size: 11px;
        color: #8a7a6a;
        text-align: center;
        padding: 4px;
    }
</style>

<div class="card">
    <div class="header-box">
        <div class="title">♟️ CHESS MASTER</div>
        <div class="status-turn">
            <span class="indicator" id="indicator"></span>
            <span id="status-text">Giliranmu</span>
        </div>
    </div>

    <div class="levels" id="levels-list"></div>

    <div id="board-wrapper">
        <div id="board"></div>
    </div>

    <div class="control-panel">
        <div class="footer-log" id="log-moves">Game dimulai</div>
        <div class="btn-group">
            <button class="btn-action" id="btn-undo">↩ Undo</button>
            <button class="btn-action" id="btn-reset">⟳ New</button>
        </div>
    </div>
</div>

<script>
(function() {
    const PIECES = { KING: 'k', QUEEN: 'q', ROOK: 'r', BISHOP: 'b', KNIGHT: 'n', PAWN: 'p' };
    const COLORS = { WHITE: 'w', BLACK: 'b' };
    const SYMBOLS = {
        'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
        'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
    };
    
    const LEVELS = [
        { name: 'Pemula', depth: 1 },
        { name: 'Menengah', depth: 2 },
        { name: 'Master', depth: 3 }
    ];

    let state = {
        board: [],
        turn: COLORS.WHITE,
        selected: null,
        legalMoves: [],
        history: [],
        gameOver: false,
        thinking: false,
        level: 1
    };

    function initBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        const back = [PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN, PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK];
        for (let c = 0; c < 8; c++) {
            board[0][c] = { type: back[c], color: COLORS.BLACK };
            board[1][c] = { type: PIECES.PAWN, color: COLORS.BLACK };
            board[6][c] = { type: PIECES.PAWN, color: COLORS.WHITE };
            board[7][c] = { type: back[c], color: COLORS.WHITE };
        }
        return board;
    }

    function cloneBoard(b) { return b.map(row => row.map(cell => cell ? { ...cell } : null)); }
    function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    function generateMoves(board, color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p || p.color !== color) continue;
                const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

                if (p.type === PIECES.PAWN) {
                    const dir = color === COLORS.WHITE ? -1 : 1;
                    const start = color === COLORS.WHITE ? 6 : 1;
                    if (inBounds(r + dir, c) && !board[r + dir][c]) {
                        moves.push({ from: [r, c], to: [r + dir, c] });
                        if (r === start && !board[r + 2 * dir][c]) moves.push({ from: [r, c], to: [r + 2 * dir, c] });
                    }
                    for (const dc of [-1, 1]) {
                        const nr = r + dir, nc = c + dc;
                        if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc].color === enemy) moves.push({ from: [r, c], to: [nr, nc] });
                    }
                }
                if (p.type === PIECES.KNIGHT) {
                    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
                    for (const [dr, dc] of offsets) {
                        const nr = r + dr, nc = c + dc;
                        if (inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy)) moves.push({ from: [r, c], to: [nr, nc] });
                    }
                }
                if (p.type === PIECES.BISHOP || p.type === PIECES.QUEEN) {
                    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
                        for (let i = 1; i < 8; i++) {
                            const nr = r + dr * i, nc = c + dc * i;
                            if (!inBounds(nr, nc)) break;
                            if (board[nr][nc]) { if (board[nr][nc].color === enemy) moves.push({ from: [r, c], to: [nr, nc] }); break; }
                            moves.push({ from: [r, c], to: [nr, nc] });
                        }
                    }
                }
                if (p.type === PIECES.ROOK || p.type === PIECES.QUEEN) {
                    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                        for (let i = 1; i < 8; i++) {
                            const nr = r + dr * i, nc = c + dc * i;
                            if (!inBounds(nr, nc)) break;
                            if (board[nr][nc]) { if (board[nr][nc].color === enemy) moves.push({ from: [r, c], to: [nr, nc] }); break; }
                            moves.push({ from: [r, c], to: [nr, nc] });
                        }
                    }
                }
                if (p.type === PIECES.KING) {
                    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
                        const nr = r + dr, nc = c + dc;
                        if (inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy)) moves.push({ from: [r, c], to: [nr, nc] });
                    }
                }
            }
        }
        return moves;
    }

    function findKing(board, color) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] && board[r][c].type === PIECES.KING && board[r][c].color === color) return [r, c];
            }
        }
        return null;
    }

    function isInCheck(board, color) {
        const king = findKing(board, color);
        if (!king) return true;
        const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        for (const m of generateMoves(board, enemy)) {
            if (m.to[0] === king[0] && m.to[1] === king[1]) return true;
        }
        return false;
    }

    function makeMove(board, move) {
        const nb = cloneBoard(board);
        const p = nb[move.from[0]][move.from[1]];
        nb[move.to[0]][move.to[1]] = p;
        nb[move.from[0]][move.from[1]] = null;
        if (p.type === PIECES.PAWN && (move.to[0] === 0 || move.to[0] === 7)) {
            nb[move.to[0]][move.to[1]] = { type: PIECES.QUEEN, color: p.color };
        }
        return nb;
    }

    function getLegalMoves(board, color) {
        return generateMoves(board, color).filter(m => !isInCheck(makeMove(board, m), color));
    }

    const VALUES = { [PIECES.PAWN]: 10, [PIECES.KNIGHT]: 30, [PIECES.BISHOP]: 30, [PIECES.ROOK]: 50, [PIECES.QUEEN]: 90, [PIECES.KING]: 900 };
    
    function evaluate(board) {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p) continue;
                let val = VALUES[p.type];
                if (r >= 3 && r <= 4 && c >= 3 && c <= 4) val += 1;
                score += (p.color === COLORS.WHITE ? val : -val);
            }
        }
        return score;
    }

    function minimax(board, depth, alpha, beta, isMax) {
        const color = isMax ? COLORS.BLACK : COLORS.WHITE;
        const moves = getLegalMoves(board, color);
        
        if (depth === 0 || moves.length === 0) return { score: evaluate(board) };

        let bestMove = moves[0];
        if (isMax) {
            let maxE = -Infinity;
            for (const m of moves) {
                const res = minimax(makeMove(board, m), depth - 1, alpha, beta, false);
                if (res.score > maxE) { maxE = res.score; bestMove = m; }
                alpha = Math.max(alpha, res.score);
                if (beta <= alpha) break;
            }
            return { score: maxE, move: bestMove };
        } else {
            let minE = Infinity;
            for (const m of moves) {
                const res = minimax(makeMove(board, m), depth - 1, alpha, beta, true);
                if (res.score < minE) { minE = res.score; bestMove = m; }
                beta = Math.min(beta, res.score);
                if (beta <= alpha) break;
            }
            return { score: minE, move: bestMove };
        }
    }

    function chooseAIMove() {
        const moves = getLegalMoves(state.board, COLORS.BLACK);
        if (moves.length === 0) return null;
        const targetDepth = LEVELS[state.level].depth;
        if (targetDepth === 1 && Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        return minimax(state.board, targetDepth, -Infinity, Infinity, true).move;
    }

    const boardEl = document.getElementById('board');
    const statusText = document.getElementById('status-text');
    const indicator = document.getElementById('indicator');
    const logMoves = document.getElementById('log-moves');
    const levelsList = document.getElementById('levels-list');

    function buildLevels() {
        levelsList.innerHTML = '';
        LEVELS.forEach((lvl, i) => {
            const btn = document.createElement('button');
            btn.className = 'level-btn' + (i === state.level ? ' active' : '');
            btn.textContent = lvl.name;
            btn.onclick = () => {
                state.level = i;
                buildLevels();
                resetGame();
            };
            levelsList.appendChild(btn);
        });
    }

    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                const isLight = (r + c) % 2 === 0;
                cell.className = 'cell ' + (isLight ? 'light' : 'dark');

                const p = state.board[r][c];
                if (p) {
                    const span = document.createElement('span');
                    span.className = 'piece ' + (p.color === COLORS.WHITE ? 'white' : 'black');
                    span.textContent = SYMBOLS[p.color + p.type];
                    cell.appendChild(span);
                }

                if (state.selected && state.selected[0] === r && state.selected[1] === c) {
                    cell.classList.add('selected');
                }

                if (state.history.length > 0) {
                    const last = state.history[state.history.length - 1];
                    if ((last.from[0] === r && last.from[1] === c) || (last.to[0] === r && last.to[1] === c)) {
                        cell.classList.add('last-move');
                    }
                }

                if (state.selected) {
                    const match = state.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
                    if (match) {
                        const dot = document.createElement('div');
                        dot.className = state.board[r][c] ? 'capture-dot' : 'move-dot';
                        cell.appendChild(dot);
                    }
                }

                cell.addEventListener('click', () => onCellClick(r, c));
                boardEl.appendChild(cell);
            }
        }

        if (state.gameOver) {
            indicator.className = 'indicator';
        } else if (state.thinking) {
            statusText.textContent = 'AI Berpikir...';
            indicator.className = 'indicator is-ai is-thinking';
        } else {
            statusText.textContent = state.turn === COLORS.WHITE ? 'Giliranmu (Putih)' : 'Giliran AI (Hitam)';
            indicator.className = 'indicator' + (state.turn === COLORS.BLACK ? ' is-ai' : '');
        }
    }

    function onCellClick(r, c) {
        if (state.gameOver || state.thinking || state.turn !== COLORS.WHITE) return;
        const p = state.board[r][c];
        if (p && p.color === COLORS.WHITE) {
            state.selected = [r, c];
            state.legalMoves = getLegalMoves(state.board, COLORS.WHITE).filter(m => m.from[0] === r && m.from[1] === c);
            render();
            return;
        }
        if (state.selected) {
            const m = state.legalMoves.find(x => x.to[0] === r && x.to[1] === c);
            if (m) {
                executeMove(m);
                return;
            }
            state.selected = null;
            state.legalMoves = [];
            render();
        }
    }

    function executeMove(m) {
        state.board = makeMove(state.board, m);
        state.history.push(m);
        state.selected = null;
        state.legalMoves = [];
        logMoves.textContent = 'Jalan: ' + 'abcdefgh'[m.from[1]] + (8 - m.from[0]) + ' → ' + 'abcdefgh'[m.to[1]] + (8 - m.to[0]);
        if (getLegalMoves(state.board, COLORS.BLACK).length === 0) {
            state.gameOver = true;
            statusText.textContent = '🏆 Kamu Menang! Skakmat.';
            render();
            return;
        }
        state.turn = COLORS.BLACK;
        state.thinking = true;
        render();
        setTimeout(() => {
            const aiMoveRes = chooseAIMove();
            if (aiMoveRes) {
                state.board = makeMove(state.board, aiMoveRes);
                state.history.push(aiMoveRes);
            }
            state.thinking = false;
            state.turn = COLORS.WHITE;
            if (getLegalMoves(state.board, COLORS.WHITE).length === 0) {
                state.gameOver = true;
                statusText.textContent = '💀 AI Menang! Skakmat.';
            }
            render();
        }, 400);
    }

    function resetGame() {
        state.board = initBoard();
        state.turn = COLORS.WHITE;
        state.selected = null;
        state.legalMoves = [];
        state.history = [];
        state.gameOver = false;
        state.thinking = false;
        logMoves.textContent = 'Game baru dimulai';
        render();
    }

    document.getElementById('btn-reset').addEventListener('click', resetGame);
    document.getElementById('btn-undo').addEventListener('click', () => {
        if (state.gameOver || state.history.length < 2 || state.thinking) return;
        state.history.pop();
        state.history.pop();
        state.board = initBoard();
        for (const m of state.history) state.board = makeMove(state.board, m);
        state.turn = COLORS.WHITE;
        state.selected = null;
        state.legalMoves = [];
        logMoves.textContent = 'Langkah dibatalkan';
        render();
    });

    state.board = initBoard();
    buildLevels();
    render();
})();
</script>
`;

// ════════════════════════════════════════════════════════════
// ✅ HANDLER
// ════════════════════════════════════════════════════════════
let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, {
            react: { text: '♟️', key: m.key }
        });
    } catch (_) {}

    try {
        const responseId = `chess_${Date.now()}`;

        const base64Data = Buffer.from(
            JSON.stringify({
                response_id: responseId,
                sections: [
                    {
                        view_model: {
                            primitive: {
                                __typename: "GenAIaeacdsnwHtmlPrimitive",
                                payload: HTML_PAYLOAD,
                                trusted_sources: ["chess.engine", config?.ownerName || "FARRMD V2"]
                            },
                            __typename: "GenAISingleLayoutViewModel"
                        }
                    }
                ]
            })
        ).toString('base64');

        const rawMessage = {
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
                        submessages: [
                            {
                                messageType: 2,
                                messageText: "♟️ CHESS MASTER (Multi-Level AI)"
                            }
                        ],
                        unifiedResponse: {
                            data: base64Data
                        },
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardOrigin: 4
                        }
                    }
                }
            }
        };

        await conn.relayMessage(m.chat, rawMessage, {});

        try {
            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });
        } catch (_) {}

    } catch (error) {
        console.error('[CHESS ERROR]', error);
        try {
            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
        } catch (_) {}
        await conn.sendMessage(m.chat, { text: `❌ Gagal memuat game catur:\n\n${error.message}` }, { quoted: m });
    }
};

handler.command = ['catur', 'chess', 'caturain', 'maincatur'];
handler.ownerOnly = false;
handler.premium = false;
handler.group = false;
handler.admin = false;

export default handler;
