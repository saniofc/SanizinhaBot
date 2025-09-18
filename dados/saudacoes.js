const moment = require('moment-timezone');
async function responderSaudacao({ from, sock, msg, podeResponderSaudacao }) {
  if (msg.key.fromMe) return;
  if (!from.endsWith('@g.us')) return;
  const agora = moment().tz('America/Sao_Paulo');
  const hora = agora.hour();
  const mensagem = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.imageMessage?.caption ||
                   msg.message?.videoMessage?.caption ||
                   '';
  const msgLower = mensagem.toLowerCase();
  const saudacoes = ['bom dia', 'boa tarde', 'boa noite'];
  for (const saudacao of saudacoes) {
    if (msgLower.includes(saudacao)) {
      if (!podeResponderSaudacao(from, saudacao)) break;
      let horarioCerto =
        hora >= 5 && hora < 12
          ? 'bom dia'
          : hora >= 12 && hora < 18
          ? 'boa tarde'
          : 'boa noite';
      const correta = saudacao.includes(horarioCerto);
      let resposta = correta
        ? `${horarioCerto.charAt(0).toUpperCase() + horarioCerto.slice(1)}`
        : `Oxi, mas agora é ${horarioCerto}! 😂`;
      await sock.sendMessage(from, { text: resposta }, { quoted: msg });
      break;
    }
  }
}
module.exports = { responderSaudacao };