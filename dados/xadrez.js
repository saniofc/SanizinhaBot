// ===== MÓDULO COMPLETO DE XADREZ =====

// PRESTA ATENÇÃO PRA NAO FAZER MERDA🫵
const games = {}; // partidas por grupo
const WHITE_PIECES = ['🎠','🫅🏻','👸🏻','👴🏻','🐦','🤵🏻']; // cavalo, rei, rainha, bispo, torre branca, peao branco
const BLACK_PIECES = ['🐎','🤴🏿','👸🏿','👴🏿','🐦‍⬛','🤵🏿']; // cavalo, rei, rainha, bispo, torre preta, peao preto

// símbolos usados no inicialBoard:
const BACK_BLACK = ['🐦‍⬛','🐎','👴🏿','👸🏿','🤴🏿','👴🏿','🐎','🐦‍⬛']; // A
const PAWNS_BLACK = ['🤵🏿','🤵🏿','🤵🏿','🤵🏿','🤵🏿','🤵🏿','🤵🏿','🤵🏿']; // B
const BACK_WHITE = ['🐦','🎠','👴🏻','👸🏻','🫅🏻','👴🏻','🎠','🐦']; // H
const PAWNS_WHITE = ['🤵🏻','🤵🏻','🤵🏻','🤵🏻','🤵🏻','🤵🏻','🤵🏻','🤵🏻']; // G

function initialBoard() {
    return [
        BACK_BLACK.slice(),   // A (row 0)
        PAWNS_BLACK.slice(),  // B (row 1)
        ['⬜','⬛','⬜','⬛','⬜','⬛','⬜','⬛'], // C (2)
        ['⬛','⬜','⬛','⬜','⬛','⬜','⬛','⬜'], // D (3)
        ['⬜','⬛','⬜','⬛','⬜','⬛','⬜','⬛'], // E (4)
        ['⬛','⬜','⬛','⬜','⬛','⬜','⬛','⬜'], // F (5)
        PAWNS_WHITE.slice(),  // G (6)
        BACK_WHITE.slice()    // H (7)
    ];
}

// renderBoard: sem espaços extras, alinhado
function renderBoard(board) {
    const letras = ['A','B','C','D','E','F','G','H'];
    let header = '...1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣\n';
    let result = '';

    for (let i = 0; i < 8; i++) {
        let line = letras[i] + ' ';
        for (let j = 0; j < 8; j++) {
            line += board[i][j];
        }
        result += line + '\n';
    }

    return header + result;
}

// helpers de utilidade
function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }
function cloneBoard(b){ return b.map(row => row.slice()); }
function findKing(board, isWhite){
    const king = isWhite ? '🫅🏻' : '🤴🏿';
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]===king) return [r,c];
    return null;
}
function isWhitePiece(sym){ return WHITE_PIECES.includes(sym); }
function isBlackPiece(sym){ return BLACK_PIECES.includes(sym); }

// converte "A2" -> row,col
function coordToIndex(coord) {
    coord = coord.trim().toUpperCase();
    const letras = ['A','B','C','D','E','F','G','H'];
    if (!/^[A-H][1-8]$/.test(coord)) return null;
    const r = letras.indexOf(coord[0]);
    const c = parseInt(coord[1],10) - 1;
    return [r,c];
}

// gera movimentos pseudo-legais
function generatePseudoMoves(game, fromRow, fromCol) {
    const board = game.board;
    const piece = board[fromRow][fromCol];
    if (!piece) return [];
    const moves = [];
    const isWhite = isWhitePiece(piece);

    const pushIf = (r,c) => { if(inBounds(r,c)) moves.push([fromRow,fromCol,r,c]); };

    // PAWNS
    if (piece === '🤵🏻' || piece === '🤵🏿') {
        const dir = piece === '🤵🏻' ? -1 : 1;
        const startRow = piece === '🤵🏻' ? 6 : 1;
        const r1 = fromRow + dir, c1 = fromCol;
        if(inBounds(r1,c1) && (board[r1][c1]==='⬜' || board[r1][c1]==='⬛')) moves.push([fromRow,fromCol,r1,c1]);
        const r2 = fromRow + 2*dir;
        if(fromRow === startRow && inBounds(r2,c1) && (board[r1][c1]==='⬜'||board[r1][c1]==='⬛') && (board[r2][c1]==='⬜'||board[r2][c1]==='⬛')) moves.push([fromRow,fromCol,r2,c1]);
        for(const dc of [-1,1]) {
            const rc = fromRow + dir, cc = fromCol + dc;
            if(inBounds(rc,cc)){
                const target = board[rc][cc];
                if(isWhitePiece(piece) && isBlackPiece(target)) moves.push([fromRow,fromCol,rc,cc]);
                if(isBlackPiece(piece) && isWhitePiece(target)) moves.push([fromRow,fromCol,rc,cc]);
            }
        }
        if(game.enPassant){
            const [er,ec] = game.enPassant;
            if(er === fromRow && Math.abs(ec - fromCol) === 1){
                const rc = fromRow + dir, cc = ec;
                if(inBounds(rc,cc)) moves.push([fromRow,fromCol,rc,cc,'ep']);
            }
        }
        return moves;
    }

    // KNIGHT
    if (piece === '🎠' || piece === '🐎') {
        const deltas = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        for(const [dr,dc] of deltas){
            const r = fromRow+dr, c = fromCol+dc;
            if(!inBounds(r,c)) continue;
            const target = board[r][c];
            if((isWhite && isWhitePiece(target)) || (!isWhite && isBlackPiece(target))) continue;
            moves.push([fromRow,fromCol,r,c]);
        }
        return moves;
    }

    // SLIDERS
    const slide = (directions) => {
        for(const [dr,dc] of directions){
            let r = fromRow+dr, c = fromCol+dc;
            while(inBounds(r,c)){
                const target = board[r][c];
                if(target === '⬜' || target === '⬛'){
                    moves.push([fromRow,fromCol,r,c]);
                } else {
                    if((isWhite && isBlackPiece(target)) || (!isWhite && isWhitePiece(target))) moves.push([fromRow,fromCol,r,c]);
                    break;
                }
                r += dr; c += dc;
            }
        }
    };
    if (piece === '🐦' || piece === '🐦‍⬛') slide([[1,0],[-1,0],[0,1],[0,-1]]);
    if (piece === '👴🏻' || piece === '👴🏿') slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
    if (piece === '👸🏻' || piece === '👸🏿') slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);

    // KING
    if (piece === '🫅🏻' || piece === '🤴🏿') {
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){
            if(dr===0 && dc===0) continue;
            const r = fromRow+dr, c = fromCol+dc;
            if(!inBounds(r,c)) continue;
            const target = board[r][c];
            if((isWhitePiece(piece) && isWhitePiece(target)) || (isBlackPiece(piece) && isBlackPiece(target))) continue;
            moves.push([fromRow,fromCol,r,c]);
        }
        // castling
        if(isWhitePiece(piece)){
            if(game.castling.whiteKingSide) moves.push([fromRow,fromCol,fromRow,fromCol+2,'castleK']);
            if(game.castling.whiteQueenSide) moves.push([fromRow,fromCol,fromRow,fromCol-2,'castleQ']);
        } else {
            if(game.castling.blackKingSide) moves.push([fromRow,fromCol,fromRow,fromCol+2,'castleK']);
            if(game.castling.blackQueenSide) moves.push([fromRow,fromCol,fromRow,fromCol-2,'castleQ']);
        }
    }

    return moves;
}

// gera movimentos legais (filtra xeque)
function generateLegalMoves(game, fromRow, fromCol) {
    const pseudo = generatePseudoMoves(game, fromRow, fromCol);
    const legal = [];
    for(const mv of pseudo){
        const copy = {
            board: cloneBoard(game.board),
            castling: { ...game.castling },
            enPassant: game.enPassant ? [game.enPassant[0], game.enPassant[1]] : null
        };
        const [fr,fc,tr,tc,flag] = mv;
        const piece = copy.board[fr][fc];
        if(flag === 'ep'){
            copy.board[tr][tc] = piece;
            copy.board[fr][tc] = ( (fr + tc) % 2 === 0 ) ? '⬜' : '⬛';
            copy.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
        } else if(flag === 'castleK' || flag === 'castleQ'){
            copy.board[tr][tc] = piece;
            copy.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
            const rookFromC = flag==='castleK'?7:0;
            const rookToC = flag==='castleK'?tc-1:tc+1;
            copy.board[fr][rookToC] = copy.board[fr][rookFromC];
            copy.board[fr][rookFromC] = ( (fr + rookFromC) % 2 === 0 ) ? '⬜' : '⬛';
        } else {
            copy.board[tr][tc] = piece;
            copy.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
        }
        const sideIsWhite = isWhitePiece(piece);
        const kingPos = findKing(copy.board, sideIsWhite);
        if(!kingPos) continue;
        if(!isSquareAttacked(copy.board, kingPos[0], kingPos[1], !sideIsWhite)) legal.push(mv);
    }
    return legal;
}

// verifica se square é atacado
function isSquareAttacked(board, r, c, attackerIsWhite) {
    for(let i=0;i<8;i++) for(let j=0;j<8;j++){
        const p = board[i][j];
        if(p==='⬜' || p==='⬛') continue;
        if(attackerIsWhite && !isWhitePiece(p)) continue;
        if(!attackerIsWhite && !isBlackPiece(p)) continue;
        const mockGame = { board: board, enPassant: null, castling: { whiteKingSide:false, whiteQueenSide:false, blackKingSide:false, blackQueenSide:false } };
        const pseudo = generatePseudoMoves(mockGame, i, j);
        for(const mv of pseudo){
            const [, , tr, tc,] = mv;
            if(tr === r && tc === c) return true;
        }
    }
    return false;
}

// check
function isInCheck(game, isWhite) {
    const kingPos = findKing(game.board, isWhite);
    if(!kingPos) return true;
    return isSquareAttacked(game.board, kingPos[0], kingPos[1], !isWhite);
}

// tem algum movimento legal?
function hasAnyLegalMove(game, isWhite) {
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const piece = game.board[r][c];
        if(piece==='⬜' || piece==='⬛') continue;
        if(isWhite && !isWhitePiece(piece)) continue;
        if(!isWhite && !isBlackPiece(piece)) continue;
        if(generateLegalMoves(game,r,c).length>0) return true;
    }
    return false;
}

// aplica movimento
function applyMove(game, mv, sender) {
    const [fr,fc,tr,tc,flag] = mv;
    const piece = game.board[fr][fc];

    if(flag === 'ep'){
        const capRow = fr;
        game.board[tr][tc] = piece;
        game.board[fr][tc] = ( (fr + tc) % 2 === 0 ) ? '⬜' : '⬛';
        game.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
    } else if(flag === 'castleK' || flag === 'castleQ'){
        game.board[tr][tc] = piece;
        game.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
        const rookC = flag==='castleK'?7:0;
        const rookTo = flag==='castleK'?tc-1:tc+1;
        game.board[fr][rookTo] = game.board[fr][rookC];
        game.board[fr][rookC] = ( (fr + rookC) % 2 === 0 ) ? '⬜' : '⬛';
        if(isWhitePiece(piece)){
            game.castling.whiteKingSide = false;
            game.castling.whiteQueenSide = false;
        } else {
            game.castling.blackKingSide = false;
            game.castling.blackQueenSide = false;
        }
    } else {
        game.board[tr][tc] = piece;
        game.board[fr][fc] = ( (fr + fc) % 2 === 0 ) ? '⬜' : '⬛';
    }

    // en passant setup
    if(piece === '🤵🏻' || piece === '🤵🏿'){
        if(Math.abs(tr - fr) === 2) game.enPassant = [(fr+tr)/2, fc];
        else game.enPassant = null;
    } else game.enPassant = null;

    // castling rights update
    if(piece === '🫅🏻') { game.castling.whiteKingSide = false; game.castling.whiteQueenSide = false; }
    if(piece === '🤴🏿') { game.castling.blackKingSide = false; game.castling.blackQueenSide = false; }
    if(fr === 7 && fc === 0) game.castling.whiteQueenSide = false;
    if(fr === 7 && fc === 7) game.castling.whiteKingSide = false;
    if(fr === 0 && fc === 0) game.castling.blackQueenSide = false;
    if(fr === 0 && fc === 7) game.castling.blackKingSide = false;

    // promotion
    if(game.board[tr][tc] === '🤵🏻' && tr === 0) game.board[tr][tc] = '🫅🏻';
    if(game.board[tr][tc] === '🤵🏿' && tr === 7) game.board[tr][tc] = '🤴🏿';

    game.history.push({mv, by: sender, fen: null});
}

// startChallenge
async function startChallenge(sock, msg, from, isGroup){
    if(!isGroup) return await sock.sendMessage(from,{ text:'❌ Só em grupos!', quoted: msg });
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if(!mencionado) return await sock.sendMessage(from,{ text:'❌ Mencione alguém para desafiar!', quoted: msg });

    if(games[from] && games[from].status==='jogando') return await sock.sendMessage(from,{ text:'❌ Já existe uma partida em andamento neste grupo.', quoted: msg });

    games[from] = {
        board: initialBoard(),
        playerWhite: sender,
        playerBlack: mencionado,
        turno: sender,
        status: 'pendente',
        enPassant: null,
        castling: { whiteKingSide:true, whiteQueenSide:true, blackKingSide:true, blackQueenSide:true },
        history: []
    };

    await sock.sendMessage(from,{
        text: `♟️ @${sender.split('@')[0]} desafiou @${mencionado.split('@')[0]} para uma partida de Xadrez!\nDigite "sim" ou "nao" para ver os regras *infoxadrez*.`,
        mentions: [sender,mencionado]
    });
}

// aceitar/recusar
async function acceptOrDecline(sock,msg,from){
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const game = games[from];
    if(!game || game.status!=='pendente') return;
    const body = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ""
    ).toLowerCase().trim();

    // Só o desafiado pode responder
    if (sender !== game.playerBlack) return;

    if (body === "sim") {
        game.status = "jogando";
        game.board = initialBoard();
        game.turno = game.playerWhite;

        const boardText = renderBoard(game.board);
        await sock.sendMessage(from, {
            text: `♟️ Partida iniciada!\n${boardText}\n\nVez de: @${game.turno.split("@")[0]}`,
            mentions: [game.playerWhite, game.playerBlack]
        });
    } else if (body === "nao" || body === "não" || body === "nao") {
        await sock.sendMessage(from, {
            text: `❌ @${game.playerBlack.split("@")[0]} recusou o desafio.`,
            mentions: [game.playerWhite, game.playerBlack]
        });
        delete games[from];
    }
}

// resetGame: cancela/encerra
async function resetGame(sock, msg, from) {
    if (!games[from]) return await sock.sendMessage(from,{ text:'❌ Não há partida ativa neste grupo.' , quoted: msg});
    const g = games[from];
    delete games[from];
    await sock.sendMessage(from,{ text:`🛑 Partida encerrada entre @${g.playerWhite.split('@')[0]} e @${g.playerBlack.split('@')[0]}.`, mentions:[g.playerWhite,g.playerBlack]});
}

async function makeMove(sock, msg, from, raw) {
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const game = games[from];
    if (!game || game.status !== 'jogando') return;
    if (![game.playerWhite, game.playerBlack].includes(sender)) return;
    if (sender !== game.turno) return await sock.sendMessage(from, { text: '⏳ Não é sua vez!', quoted: msg });

    raw = raw.trim().toUpperCase().replace(/\s+/g, ' ');
    const parts = raw.split(' ');
    if (parts.length < 2) return await sock.sendMessage(from, { text: '❌ Formato inválido. Use "A2 A3"', quoted: msg });

    const fromCoord = coordToIndex(parts[0]);
    const toCoord = coordToIndex(parts[1]);
    if (!fromCoord || !toCoord) return await sock.sendMessage(from, { text: '❌ Coordenada inválida. Use A-H e 1-8', quoted: msg });

    const [fr, fc] = fromCoord;
    const [tr, tc] = toCoord;
    const piece = game.board[fr][fc];
    if (piece === '⬜' || piece === '⬛') return await sock.sendMessage(from, { text: '❌ Não há peça nessa posição!', quoted: msg });

    if (sender === game.playerWhite && !isWhitePiece(piece)) return await sock.sendMessage(from, { text: '⚪ Você só pode mover peças brancas!', quoted: msg });
    if (sender === game.playerBlack && !isBlackPiece(piece)) return await sock.sendMessage(from, { text: '⚫ Você só pode mover peças pretas!', quoted: msg });

    const legalMoves = generateLegalMoves(game, fr, fc);
    const chosen = legalMoves.find(mv => mv[0] === fr && mv[1] === fc && mv[2] === tr && mv[3] === tc);
    if (!chosen) return await sock.sendMessage(from, { text: '❌ Movimento inválido ou que deixa/coloca em xeque!', quoted: msg });

    applyMove(game, chosen, sender);

    game.turno = (game.turno === game.playerWhite) ? game.playerBlack : game.playerWhite;

    // ===== BLOCO CHECK COM DESTAQUE =====
    const sideIsWhite = isWhitePiece(piece);
    const kingPos = findKing(game.board, sideIsWhite);
    let checkInfo = null;

    if (isInCheck(game, sideIsWhite)) {
        const attackerIsWhite = !sideIsWhite;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = game.board[r][c];
                if (p === '⬜' || p === '⬛') continue;
                if (attackerIsWhite && !isWhitePiece(p)) continue;
                if (!attackerIsWhite && !isBlackPiece(p)) continue;

                const pseudo = generatePseudoMoves({ board: game.board }, r, c);
                for (const mv of pseudo) {
                    if (mv[2] === kingPos[0] && mv[3] === kingPos[1]) {
                        checkInfo = { piece: p, from: [r, c] };
                        break;
                    }
                }
                if (checkInfo) break;
            }
            if (checkInfo) break;
        }

        if (checkInfo) {
            let [ar, ac] = checkInfo.from;
            const [kr, kc] = kingPos;
            const dr = Math.sign(kr - ar), dc = Math.sign(kc - ac);
            let r = ar, c = ac;

            while (true) {
                if (r === kr && c === kc) {
                    game.board[r][c] = '🟥'; // destaca o rei
                    break;
                }
                if (!(r === ar && c === ac)) game.board[r][c] = '🟥'; // não sobrescreve atacante
                r += dr; c += dc;
            }
        }

        const boardTextCheck = renderBoard(game.board);
        await sock.sendMessage(from, {
            text: `@${sender.split('@')[0]} defenda sua ${checkInfo.piece} ⚠️\n${boardTextCheck}\n\nSua vez: @${game.turno.split('@')[0]}`,
            mentions: [game.turno]
        });
        return;
    }

    // ===== CHECAGEM DE XEQUE-MATE / STALEMATE =====
    const sideToMoveIsWhite = (game.turno === game.playerWhite);
    const hasLegal = hasAnyLegalMove(game, sideToMoveIsWhite);
    let endText = null;

    if (isInCheck(game, sideToMoveIsWhite) && !hasLegal) {
        endText = sideToMoveIsWhite ? `🏆 Preto venceu por xeque-mate!` : `🏆 Branco venceu por xeque-mate!`;
    } else if (!isInCheck(game, sideToMoveIsWhite) && !hasLegal) {
        endText = `♖ Empate por afogamento (stalemate).`;
    }

    const boardText = renderBoard(game.board);
    if (endText) {
        await sock.sendMessage(from, { text: `${boardText}\n\n${endText}`, mentions: [game.playerWhite, game.playerBlack] });
        delete games[from];
        return;
    }

    await sock.sendMessage(from, { text: `${boardText}\n\nSua vez: @${game.turno.split('@')[0]}`, mentions: [game.playerWhite, game.playerBlack] });
}

// ===== INFO XADREZ =====
async function infoXadrez(sock, msg, from) {
    const explicacao = `♟️ *Como jogar Xadrez no Bot* ♟️

🔹 *Iniciando uma partida*
Use:  xadrez @jogador
O desafiado responde "aceitar" ou "recusar".

🔹 *Movendo peças*
Escreva a casa de origem e destino. Ex:
"A2 A4" → move o peão da casa A2 para A4.

🔹 *Peças e movimentos*
- 🤵🏻🤵🏿 *Peão*: anda 1 casa para frente. No 1º lance pode andar 2. Captura na diagonal.
- 🎠🐎 *Cavalo*: anda em L (2+1 casas). Pode pular peças.
- 🐦🐦‍⬛ *Torre*: anda em linhas retas (horizontal/vertical).
- 👴🏻👴🏿 *Bispo*: anda em diagonais.
- 👸🏻👸🏿 *Rainha*: combina torre + bispo (qualquer direção).
- 🫅🏻🤴🏿 *Rei*: anda 1 casa em qualquer direção.

🔹 *Regras especiais*
- Roque: movimento do rei + torre juntos (defesa).
- En Passant: captura especial do peão.
- Promoção: quando peão chega no final do tabuleiro, vira peça maior.
- Xeque: quando o rei está ameaçado.
- Xeque-mate: quando o rei não pode escapar. Fim da partida.
- Afogamento: empate quando o jogador não tem movimentos legais e não está em xeque.

✨ Dica: sempre mova escrevendo "CASA_INICIAL CASA_FINAL" (ex: E2 E4).`;

    await sock.sendMessage(from, { text: explicacao, quoted: msg });
}

module.exports = {
    games,
    initialBoard,
    renderBoard,
    makeMove,
    startChallenge,
    infoXadrez,
    acceptOrDecline,
    resetGame
};