const path = require('path');
const fs = require('fs');
const cooldowns = {};

async function sanizinhaResponder(msg, sock, conversaUsuario, dono, isGroup) {
  if (!isGroup) return;                // só grupo
  if (msg.key.fromMe) return;          // não responde a si mesmo

  const msgTexto =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    '';

  const chatId = msg.key.remoteJid;
  const user = msg.key.participant || msg.key.remoteJid;

  if (!conversaUsuario[chatId]) conversaUsuario[chatId] = {};
  if (!conversaUsuario[chatId][user])
    conversaUsuario[chatId][user] = { ultimaPergunta: null, esperaResposta: null };

  const msgLower = msgTexto.toLowerCase();
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
  const quotedMessage = contextInfo?.quotedMessage;

  // ✅ Aqui: verifica se a mensagem é reply a mensagem do bot
  const isReplyToBot = !!(
    quotedMessage && 
    (
      contextInfo?.participant === botNumber || // pessoa respondeu ao bot
      quotedMessage?.fromMe // a mensagem citada foi enviada pelo bot
    )
  );

  const canRespond = (tipo, tempo = 30000) => {
    const key = `${chatId}-${user}-${tipo}`;
    const now = Date.now();
    if (!cooldowns[key] || now - cooldowns[key] > tempo) {
      cooldowns[key] = now;
      return true;
    }
    return false;
  };

  // =================== EXEMPLOS ===================
  const olas = /^(oi+|oiê+|oie+|ooiii+|oii+|roii+|roi+|roiee+|oiii+|olaa+|oiie+|oiii+|eai+|eae+|eaiii+)$/i;
  if (olas.test(msgTexto) && canRespond('oi') && isReplyToBot) {
    const frasesOla = [
      'oi tudo bom?',
      'eae blz?',
      'oi',
      'fala ai blz',
      'eae tudo bom?',
      'oii, como cê tá?',
      'salve, tdbom?',
      'opa, tudo bom?',
      'oiê, tranquilo?'
    ];
    const fraseAleatoria = frasesOla[Math.floor(Math.random() * frasesOla.length)];
    await sock.sendMessage(chatId, { text: fraseAleatoria, mentions: [user] });
    conversaUsuario[chatId][user].ultimaPergunta = 'td bom?';
    return;
  }

// resposta "sim" apenas se for reply ao bot
const sims = /^(sim+|simm+|ss|si|yes|to\s?sim|tô\s?bem|to\s?bem|bem|to\s?bem\s?agora|tô\s?bem\s?agora|melhor\s?agora|tô\s?melhor\s?agora|s|siim|sm|tô\s?vivendo|tô\s?deitado|deitado)$/i;

if (
  sims.test(msgTexto) &&
  conversaUsuario[chatId][user].ultimaPergunta === 'td bom?' &&
  isReplyToBot
) {
  await sock.sendMessage(chatId, { text: `que bom😸`, mentions: [user] });
  conversaUsuario[chatId][user].ultimaPergunta = null;
  conversaUsuario[chatId][user].esperaResposta = 'e vc?';
  return;
}

  // respostas de áudio apenas se for reply ao bot
  const frasesMal = /\b(bot[\s,]*)?(não tô bem|tô com depressão|tenho depressão|sou depressivo|não tenho amigos|tô mal|tô doente|tô gripado|tô morrendo|não tô legal)\b/i;
  if (frasesMal.test(msgTexto) && isReplyToBot && canRespond('naoBem', 60000)) {
    const audioURL = 'https://files.catbox.moe/j9nfik.mp3';
    await sock.sendMessage(chatId, { 
      audio: { url: audioURL }, 
      mimetype: 'audio/mpeg',
      ptt: false,
      quoted: msg,
      mentions: [user]
    });
    conversaUsuario[chatId][user].ultimaPergunta = null;
    return;
  }

  const frasesSexo = /\b(sexo|transar|transa|fazer amor|quero transar)\b/i;
  if (frasesSexo.test(msgTexto) && isReplyToBot && canRespond('sexo', 60000)) {
    const audioURL1 = 'https://files.catbox.moe/9hr0d3.mp3';
    const audioURL2 = 'https://files.catbox.moe/me9332.mp3';
    await sock.sendMessage(chatId, { 
      audio: { url: audioURL1 }, 
      mimetype: 'audio/mpeg',
      ptt: false,
      quoted: msg
    });
    setTimeout(async () => {
      await sock.sendMessage(chatId, { 
        audio: { url: audioURL2 }, 
        mimetype: 'audio/mpeg',
        ptt: false,
        quoted: msg
      });
    }, 2000);
    return;
  }


  const evc = /^(e vc\??|e você\??)$/i;
  if (evc.test(msgTexto) && conversaUsuario[chatId][user].esperaResposta === 'e vc?' && isReplyToBot) {
    await sock.sendMessage(chatId, { text: `eu tô ótima, só não dá em cima de mim pq não sou uma humana😂` });
    conversaUsuario[chatId][user].esperaResposta = null;
    return;
  }


  const perguntasTudoBem = /\b(tudo bem|td bem|tdb(?:em)?|como (você|cê) tá|tá tudo bem|como tá)\??\b/i;
  if (perguntasTudoBem.test(msgTexto) && isReplyToBot && canRespond('tudoBem', 30000)) {
    const respostasTudoBem = [
      'tô ótima, e você? 😸',
      'tudo bem por aqui, e contigo? 😊',
      'ótima como sempre 😂',
      'tudo tranquilo, e aí? 😉'
    ];
    const resposta = respostasTudoBem[Math.floor(Math.random() * respostasTudoBem.length)];
    await sock.sendMessage(chatId, { text: resposta });
    return;
  }


  const palavrasZoar = /\b(maluca|doido|doida|maluco|drogado|drogada)\b/i;
  if (isReplyToBot && palavrasZoar.test(msgTexto) && canRespond('zoar', 60000)) {
    const audioURL = 'https://files.catbox.moe/tyc424.mp3';
    await sock.sendMessage(chatId, {
      audio: { url: audioURL },
      mimetype: 'audio/mpeg',
      ptt: false,
      quoted: msg
    });
    return;
  }


  const buchechaRegex = /\b(buchecha|buxexa|bochecha|boxexa)\b/i;
  if (buchechaRegex.test(msgTexto) && isReplyToBot && canRespond('buchecha', 60000)) {
    const audioURL = 'https://files.catbox.moe/vra4r4.mp3';
    await sock.sendMessage(chatId, { 
      audio: { url: audioURL },
      mimetype: 'audio/mpeg',
      ptt: false,
      quoted: msg
    });
    return;
  }


  const xingamentos = /\b(tmnc|tomanocu)(\s+bot)?\s*(kkk+)?$/i;
  if (xingamentos.test(msgTexto) && isReplyToBot && canRespond('xingamento', 15000)) {
    const respostasZoar = [
      'no cu doi😂',
      'nem tenho cu🤡',
      'cala a boca antes que eu te deleto do grupo 😹',
      'tá bravinho é? 🤭',
      '𝖻𝖺𝗇',
      ';_;',
      'tmnc você, eu sou só um código inocente 😢',
      'só pq eu não mando nude já tá me xingando kkkk'
    ];
    const resposta = respostasZoar[Math.floor(Math.random() * respostasZoar.length)];
    await sock.sendMessage(chatId, { text: resposta });
    return;
  }


  if (/tu\s+já\s+deu(\s+o\s+cu)?\s*né\s*(kkk+)?$/i.test(msgTexto) && isReplyToBot && canRespond('tudeu', 15000)) {
    await sock.sendMessage(chatId, { text: 'sua mãe deu e me contou😂' });
    return;
  }


  if (/^obg(d|da|de)\b/i.test(msgTexto) && isReplyToBot && canRespond('obgd', 30000)) {
    await sock.sendMessage(chatId, { text: `dnd😸` });
    return;
  }
  const frasesApresentar = [
    "precisa se apresentar",
    "precisa se apresenta",
    "é obrigatório se apresentar",
    "tem q se apresentar",
    "pra se apresentar",
    "vou me apresentar",
    "preciso me apresentar",
    "Vou me apresentar aqui",
    "Uee,blz. Vou me apresentar aqui"
  ];
  if (frasesApresentar.some(f => msgLower.includes(f)) && isReplyToBot && canRespond('apresentar', 30000)) {
    await sock.sendMessage(chatId, { text: `nao kkk relaxa` });
    return;
  }


  if (/^(k{2,}|ksksk{0,2}|kakaka+|jsksks+|jsjsjs+|ksskssk+)$/i.test(msgTexto) &&
      isReplyToBot
  ) {
    await sock.sendMessage(chatId, { text: `😂😂😂` }, { quoted: msg });
    return;
  }
}
module.exports = sanizinhaResponder;