const gamesForca = {}; // partidas por grupo

// ===== PALAVRAS COM DICAS =====
const palavrasForca = [
  // Frutas
  { palavra: "ABACAXI", dica: "Fruta tropical amarela e cheia de espinhos" },
  { palavra: "BANANA", dica: "Fruta amarela e curvada" },
  { palavra: "MELANCIA", dica: "Fruta grande, verde por fora e vermelha por dentro" },
  { palavra: "LARANJA", dica: "Fruta cítrica, cor laranja" },
  { palavra: "MORANGO", dica: "Fruta vermelha com sementes na superfície" },
  { palavra: "KIWI", dica: "Fruta marrom por fora e verde por dentro" },
  { palavra: "COCO", dica: "Fruta marrom, dura por fora e branca por dentro" },
  { palavra: "ABACATE", dica: "Fruta verde, usada em guacamole" },
  { palavra: "UVA", dica: "Fruta pequena, roxa ou verde, usada para vinho" },
  { palavra: "PAPAYA", dica: "Fruta tropical alaranjada com sementes pretas" },

  // Comidas
  { palavra: "MACARRAO", dica: "Prato feito de massa, muito popular na Itália" },
  { palavra: "PIPOCA", dica: "Lanche de milho estourado, famoso no cinema" },
  { palavra: "STROGONOFF", dica: "Prato cremoso de carne com molho branco e ketchup" },
  { palavra: "PIZZA", dica: "Massa redonda com molho e cobertura de queijo" },
  { palavra: "HAMBURGER", dica: "Sanduíche de carne muito popular no fast-food" },
  { palavra: "LASANHA", dica: "Massa em camadas com molho e queijo" },
  { palavra: "RISOTO", dica: "Prato italiano cremoso de arroz" },

  // Animais
  { palavra: "MACACO", dica: "Animal que adora bananas e pula de árvore em árvore" },
  { palavra: "LEAO", dica: "O rei da selva" },
  { palavra: "URSO", dica: "Animal grande que gosta de mel" },
  { palavra: "ELEFANTE", dica: "Animal com tromba grande" },
  { palavra: "GIRAFA", dica: "Animal de pescoço comprido que come folhas" },
  { palavra: "TUCANO", dica: "Ave tropical com bico colorido" },
  { palavra: "JABUTI", dica: "Réptil lento com casco resistente" },

  // Bebidas
  { palavra: "VINHO", dica: "Bebida alcoólica feita a partir de uvas" },
  { palavra: "CAFE", dica: "Bebida quente que acorda as pessoas" },
  { palavra: "SUCO", dica: "Bebida feita de frutas espremidas" },
  { palavra: "CHAMPANHE", dica: "Bebida borbulhante servida em comemorações" },

  // Profissões
  { palavra: "MEDICO", dica: "Profissional que cuida da saúde das pessoas" },
  { palavra: "ENGENHEIRO", dica: "Profissional que projeta e constrói coisas" },
  { palavra: "PROFESSOR", dica: "Pessoa que ensina em escolas e universidades" },
  { palavra: "ADVOGADO", dica: "Profissional que atua na área jurídica" },
  { palavra: "COZINHEIRO", dica: "Profissional que prepara alimentos" },
  { palavra: "ARQUITETO", dica: "Profissional que projeta edifícios e casas" },
  { palavra: "FISIOTERAPEUTA", dica: "Profissional que ajuda na recuperação do corpo" },

  // Palavras difíceis / curiosidades
  { palavra: "HIPPOPOTAMO", dica: "Animal grande que vive na água e na terra" },
  { palavra: "CRISTALOGRAFIA", dica: "Estudo da estrutura dos cristais" },
  { palavra: "ECONOMIA", dica: "Ciência que estuda produção e consumo de riquezas" },
  { palavra: "PSICANALISE", dica: "Método de estudo da mente criado por Freud" },
  { palavra: "METEOROLOGIA", dica: "Ciência que estuda o clima e o tempo" },
  { palavra: "ORQUESTRA", dica: "Grupo de músicos que tocam juntos" },
  { palavra: "PARALELEPIPEDO", dica: "Sólido geométrico de seis faces retangulares" }
];

// ===== UTIL =====
function renderWord(palavra, letras) {
  return palavra.split('').map(l => letras.has(l) ? l : '_').join(' ');
}

function renderCorações(erros, maxErros) {
  const cheios = '❤️'.repeat(maxErros - erros);
  const vazios = '💔'.repeat(erros);
  return cheios + vazios;
}

function renderTabuleiro(game) {
  const usadas = Array.from(game.letras).sort().join(', ') || 'Nenhuma';
  return `💡 Dica: ${game.dica}

${renderCorações(game.erros, game.maxErros)}

${renderWord(game.palavra, game.letras)}

Letras usadas: ${usadas}`;
}

// ===== INICIAR =====
async function startForca(sock, msg, from, palavraInput) {
  if (gamesForca[from]) {
    return sock.sendMessage(from, { text: '❌ Já existe uma partida de Forca neste grupo.' }, { quoted: msg });
  }

  let palavraObj;

  if (palavraInput) {
    palavraInput = palavraInput.trim().toUpperCase();
    if (!/^[A-ZÇÃÕÉÊÍÓÚ]+$/.test(palavraInput)) {
      return sock.sendMessage(from, { text: '❌ Palavra inválida! Use apenas letras.' }, { quoted: msg });
    }
    const encontrada = palavrasForca.find(p => p.palavra === palavraInput);
    palavraObj = encontrada || { palavra: palavraInput, dica: "🔍 Sem dica" };
  } else {
    palavraObj = palavrasForca[Math.floor(Math.random() * palavrasForca.length)];
  }

  const palavra = palavraObj.palavra;
  const dica = palavraObj.dica;

  gamesForca[from] = {
    palavra,
    letras: new Set(),
    erros: 0,
    maxErros: 5,
    status: 'jogando',
    createdAt: Date.now(),
    dica
  };

  await sock.sendMessage(from, {
    text: `🎮 Jogo da Forca iniciado!\n\n${renderTabuleiro(gamesForca[from])}\n\n👉 Mandem **uma letra maiúscula** (A, B, C...) ou tentem a palavra inteira.`
  });
}

// ===== JOGAR =====
async function jogarForca(sock, msg, from, texto) {
  const game = gamesForca[from];
  if (!game || game.status !== 'jogando') return;

  const tentativa = texto.trim().toUpperCase();
  if (!tentativa) return;

  // Palavra inteira
  if (tentativa.length > 1) {
    if (tentativa === game.palavra) {
      await sock.sendMessage(from, { text: `🏆 A palavra era **${game.palavra}**!\n✅ parabéns 🤠!` });
      delete gamesForca[from];
    } else {
      game.erros++;
      if (game.erros > game.maxErros) {
        await sock.sendMessage(from, { text: `❌ Vocês perderam!\nA palavra era **${game.palavra}**.` });
        delete gamesForca[from];
      } else {
        await sock.sendMessage(from, { text: `❌ Palavra errada!\n\n${renderTabuleiro(game)}` });
      }
    }
    return;
  }

  // Letra
  const letra = tentativa[0];
  if (!/^[A-ZÇÃÕÉÊÍÓÚ]$/.test(letra)) return;

  if (game.letras.has(letra)) {
    return sock.sendMessage(from, { text: `A letra **${letra}** já foi usada!` });
  }

  game.letras.add(letra);

  if (game.palavra.includes(letra)) {
    const palavraRender = renderWord(game.palavra, game.letras);
    if (!palavraRender.includes('_')) {
      await sock.sendMessage(from, { text: `🏆 A palavra era **${game.palavra}**!\n✅ Vocês venceram!` });
      delete gamesForca[from];
    } else {
      await sock.sendMessage(from, { text: `✅ Boa! A letra **${letra}** existe!\n\n${renderTabuleiro(game)}` });
    }
  } else {
    game.erros++;
    if (game.erros > game.maxErros) {
      await sock.sendMessage(from, { text: `❌ Vocês perderam!\nA palavra era **${game.palavra}**.` });
      delete gamesForca[from];
    } else {
      await sock.sendMessage(from, { text: `❌ A letra **${letra}** não existe!\n\n${renderTabuleiro(game)}` });
    }
  }
}

// ===== RESET =====
async function resetForca(sock, msg, from) {
  if (!gamesForca[from]) {
    return sock.sendMessage(from, { text: '❌ Não há jogo de Forca neste grupo.' }, { quoted: msg });
  }
  delete gamesForca[from];
  await sock.sendMessage(from, { text: '🛑 Jogo da Forca encerrado.' });
}

// ===== EXPORTS =====
module.exports = {
  gamesForca,
  palavrasForca,
  startForca,
  jogarForca,
  resetForca
};