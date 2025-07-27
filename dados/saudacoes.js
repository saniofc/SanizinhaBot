const moment = require('moment-timezone');
async function responderSaudacao({ from, sock, msg, podeResponderSaudacao }) {
  const agora = moment().tz('America/Sao_Paulo');
  const hora = agora.hour();
  const mensagem = msg.message?.conversation ||
                   msg.message?.extendedTextMessage?.text ||
                   msg.message?.imageMessage?.caption ||
                   msg.message?.videoMessage?.caption ||
                   '';
  const msgLower = mensagem.toLowerCase();
  const saudacoes = ['bom dia', 'boa tarde', 'oi boa noite', 'oi bom dia', 'oi boa tarde', 'boa noite'];
  for (const saudacao of saudacoes) {
    if (msgLower.includes(saudacao)) {
      const correta =
        (hora >= 5 && hora < 12 && saudacao === 'bom dia') ||
        (hora >= 12 && hora < 18 && saudacao === 'boa tarde') ||
        ((hora >= 18 || hora < 5) && saudacao === 'boa noite');
      if (!podeResponderSaudacao(from, saudacao)) break;
      let resposta = '';
      if (correta) {
        resposta = `${saudacao.charAt(0).toUpperCase() + saudacao.slice(1)} 😁`;
      } else {
        let horarioCerto =
          hora >= 5 && hora < 12
            ? 'bom dia'
            : hora >= 12 && hora < 18
            ? 'boa tarde'
            : 'boa noite';
        resposta = `Oxi, mas agora é ${horarioCerto}! 😂`;
      }
      await sock.sendMessage(from, { text: resposta }, { quoted: msg });
      break;
    }
  }
}
module.exports = { responderSaudacao };