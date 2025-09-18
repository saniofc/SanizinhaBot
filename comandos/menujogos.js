const fs = require('fs');
const path = require('path');
const axios = require('axios');
const infoPath = path.resolve(__dirname, '../dono/info.json');

let nomebot = 'SanizinhaBot💕';
let numerodono = '';
try {
  const info = require(infoPath);
  nomebot = info.nomebot || nomebot;
  numerodono = info.numerodono || numerodono;
} catch (e) {
  console.warn(`⚠️ Não foi possível carregar info.json em ${infoPath}, usando valores padrão.`);
}

module.exports = async function menuJogos(msg, sock, from) {
  try {
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid || from;
    const userTag = `@${sender.split('@')[0]}`;

    const thumbnailUrl = 'https://files.catbox.moe/1716db.jpg';
    async function getBuffer(url) {
      try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
      } catch (err) {
        return null;
      }
    }
    const thumbnail = await getBuffer(thumbnailUrl);
await sock.sendMessage(from, { react: { text: '🙇🏻‍♀️', key: msg.key } });
    const lermais = '\u200E'.repeat(4000);
    const menuText = `
☆.  × ✦  ☆°. * ✦°. × ☆ 
_💖 𝔹𝕖𝕞 𝕧𝕚𝕟𝕕𝕠 ✨_
${userTag}
---------------------------
${lermais}
 *🏆RANKS🏆*
> 🥎 rank
> 🥎 rankgay
> 🥎 rankgado
> 🥎 rankcorno
> 🥎 rankfeio
> 🥎 ranklindo
> 🥎 rankputa
> 🥎 rankclt
> 🥎 rankpau
> 🥎 rankppk

 *😂ZOEIRA😂*
> 🥎 pau
> 🥎 ppk
> 🥎 lavarlouca
> 🥎 tapa
> 🥎 tapao
> 🥎 corno
> 🥎 gay
> 🥎 matar
> 🥎 beijar
> 🥎 lindo & linda
> 🥎 chance

 *🎲JOGOS🎲*
> 🥎 jogodavelha
> 🥎 vdddsf
> 🥎 dama
> 🥎 xadrez
> 🥎 campominado
> 🥎 memoria
> 🥎 forca
----------------------------
`;
    await sock.sendMessage(from, {
      text: menuText,
      mentions: [sender],
      contextInfo: {
        mentionedJid: [sender],
        externalAdReply: {
          title: '🎮 𝗠𝗘𝗡𝗨 𝗝𝗢𝗚𝗢𝗦 ✨',
          body: `❤️‍🔥 ${nomebot}`,
          mediaType: 1,
          previewType: 'PHOTO',
          thumbnail: thumbnail,
          mediaUrl: thumbnailUrl,
          sourceUrl: 'https://nexosofc'
        }
      }
    }, { quoted: msg });
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Erro ao carregar menujogos.' }, { quoted: msg });
  }
};