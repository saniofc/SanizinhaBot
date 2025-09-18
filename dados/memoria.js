const gamesMemoria = {};
const emojis = ['🍎','🍌','🍇','🍉','🍓','🥝','🍍','🥥','🥑'];
const numeros = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];

function embaralhar(arr) { 
    for (let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function mostrarTabuleiro(game){
    const t = game.tabuleiro;
    const r = game.reveladas;
    const p = game.pares;

    const render = (start, end) => 
        t.slice(start, end)
         .map((v,i) => (r.includes(i+start) || p.includes(i+start)) ? emojis[v] : numeros[i+start]+'⬜')
         .join('   ');

    return `${render(0,6)}\n${render(6,12)}\n${render(12,18)}\n${render(18,20)}`;
}

async function startChallenge(sock, msg, from, isGroup){
    if(!isGroup) return await sock.sendMessage(from,{text:'❌ Este comando só pode ser usado em grupos.'},{quoted:msg});

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const citado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;

    if(!citado) return await sock.sendMessage(from,{text:'❌ Marque ou responda alguém para jogar.',quoted:msg});
    if(citado === sender) return await sock.sendMessage(from,{text:'❌ Você não pode jogar contra você mesmo!',quoted:msg});
    if(gamesMemoria[from] && ['aguardando','jogando'].includes(gamesMemoria[from].status)) 
        return await sock.sendMessage(from,{text:'❌ Já existe uma partida de Memória neste grupo.',quoted:msg});

    const pares = [...Array(10).keys(), ...Array(10).keys()];
    const embaralhado = embaralhar(pares);

    gamesMemoria[from] = {
        jogador1: sender,
        jogador2: citado,
        status: 'aguardando',
        atual: null,
        tabuleiro: embaralhado,
        reveladas: [],
        pares: [],
        pontuacao: {[sender]:0,[citado]:0},
        tempJogada: [], // armazenará a primeira carta escolhida
        createdAt: Date.now(),
        lastMsgId: null
    };

    const sentMsg = await sock.sendMessage(from,{
        text:`🎮 @${sender.split('@')[0]} desafiou @${citado.split('@')[0]} para Memória!\nResponda "sim" ou "não".`,
        mentions:[sender,citado]
    });
    gamesMemoria[from].lastMsgId = sentMsg.key;
}

async function acceptOrDecline(sock, msg, from, text){
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const game = gamesMemoria[from];
    if(!game || game.status !== 'aguardando' || sender !== game.jogador2) return;
    text = text.trim().toLowerCase();

    if(['não','nao','n'].includes(text)){ 
        await sock.sendMessage(from,{text:`❌ @${game.jogador2.split('@')[0]} recusou.`,mentions:[game.jogador2]}); 
        delete gamesMemoria[from]; 
        return;
    }

    if(['sim','s'].includes(text)){ 
        game.status='jogando';
        game.atual = game.jogador1;

        if(game.lastMsgId) await sock.sendMessage(from,{delete: game.lastMsgId});

        const sentMsg = await sock.sendMessage(from,{
            text:`${mostrarTabuleiro(game)}\n\n🎮 Partida iniciada!\n🎯 Vez de @${game.atual.split('@')[0]}`,
            mentions:[game.jogador1,game.jogador2]
        });
        game.lastMsgId = sentMsg.key;
    }
}

async function makeMove(sock, msg, from, raw){
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    const game = gamesMemoria[from];
    if(!game || game.status !== 'jogando' || (sender!==game.jogador1 && sender!==game.jogador2)) return;
    if(sender !== game.atual) return await sock.sendMessage(from,{text:'⏳ Não é sua vez!',quoted:msg});

    const pos = parseInt(raw.trim(),10)-1;
    if(isNaN(pos) || pos < 0 || pos >= 20) 
        return await sock.sendMessage(from,{text:'❌ Jogada inválida. Digite um número entre 1 e 20.',quoted:msg});
    if(game.pares.includes(pos) || game.reveladas.includes(pos)) 
        return await sock.sendMessage(from,{text:'🟨 Esta carta já foi encontrada ou está virada.',quoted:msg});

    game.reveladas.push(pos);
    game.tempJogada.push(pos);

    if(game.lastMsgId) await sock.sendMessage(from,{delete: game.lastMsgId});

    const sentMsg = await sock.sendMessage(from,{
        text: mostrarTabuleiro(game),
        mentions: [game.jogador1, game.jogador2]
    });
    game.lastMsgId = sentMsg.key;

    // Se já escolheu duas cartas
    if(game.tempJogada.length === 2){
        await new Promise(r => setTimeout(r, 1500));

        const [a,b] = game.tempJogada;
        let texto = '';

        if(game.tabuleiro[a] === game.tabuleiro[b]){
            game.pares.push(a,b);
            game.pontuacao[sender]++;
            texto = '✅ Par encontrado! Jogue novamente!';
        } else {
            game.atual = game.atual === game.jogador1 ? game.jogador2 : game.jogador1;
            texto = `❌ Não é par!\n🎯 Agora é a vez de @${game.atual.split('@')[0]}`;
        }

        game.tempJogada = [];
        game.reveladas = [];

        if(game.lastMsgId) await sock.sendMessage(from,{delete: game.lastMsgId});

        const finalMsg = await sock.sendMessage(from,{
            text: `${mostrarTabuleiro(game)}\n\n${texto}`,
            mentions:[game.jogador1,game.jogador2]
        });
        game.lastMsgId = finalMsg.key;

        // Fim do jogo
        if(game.pares.length === 20){
            const {jogador1,jogador2,pontuacao} = game;
            delete gamesMemoria[from];
            const fim = `🏁 Fim!\n@${jogador1.split('@')[0]}: ${pontuacao[jogador1]} pares\n@${jogador2.split('@')[0]}: ${pontuacao[jogador2]} pares\n👑 ${pontuacao[jogador1] > pontuacao[jogador2] ? '@'+jogador1.split('@')[0] : pontuacao[jogador2] > pontuacao[jogador1] ? '@'+jogador2.split('@')[0] : 'Empate!'} venceu!`;
            await sock.sendMessage(from,{text: fim, mentions:[jogador1,jogador2]});
        }
    }
}

async function resetarMemoria(sock,msg,from){
    if(!gamesMemoria[from]) return await sock.sendMessage(from,{text:'❌ Não há partida em andamento.',quoted:msg});
    delete gamesMemoria[from];
    await sock.sendMessage(from,{text:'♻️ Jogo da Memória resetado!',quoted:msg});
}

module.exports = {
    gamesMemoria,
    startChallenge,
    acceptOrDecline,
    makeMove,
    resetarMemoria
};