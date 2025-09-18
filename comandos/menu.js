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

module.exports = async function menuCommand(msg, sock, from) {
  try {
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid || from;
    const userTag = `@${sender.split('@')[0]}`;
    const isDono = sender.includes(numerodono);

    const groupMetadata = await sock.groupMetadata(from);
    const isAdmin = groupMetadata.participants?.some(p =>
      p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    const admStatus = isAdmin ? '✅' : '❌';

    await sock.sendMessage(from, { react: { text: '🙇🏻', key: msg.key } });

    const hora = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const uptime = process.uptime();
    const uptimeHoras = Math.floor(uptime / 3600);
    const uptimeMin = Math.floor((uptime % 3600) / 60);
    const uptimeSeg = Math.floor(uptime % 60);

    const thumbnailUrl = 'https://files.catbox.moe/1716db.jpg';
    async function getBuffer(url) {
      try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return res.data;
      } catch (err) {
        console.error('Erro ao baixar thumbnail do menu:', err.message);
        return null;
      }
    }
    const thumbnail = await getBuffer(thumbnailUrl);
    const lermais = '\u200E'.repeat(4000);
    const menuText =
`☆.  × ✦  ☆°. * ✦°. × ☆ 
_💖 𝔹𝕖𝕞 𝕧𝕚𝕟𝕕𝕠 ✨_
> ⌚ Hora: ${hora}
> 🕐 Online há: ${uptimeHoras}h ${uptimeMin}m ${uptimeSeg}s
> 👑 Dono: ${isDono ? '☑️' : '❌'}
> 🛡️ Admin: ${admStatus}
> 👤 Usuário: ${userTag}
-------------------------------
${lermais}
 *COMANDOS*
> 🔹 menuadm
> 🔹 menudono
> 🔹 menujogos
> 🔹 grupoofc
> 🔹 sorteio
> 🔹 lojasani
> 🔹 calcular
> 🔹 criador
> 🔹 perfil
> 🔹 clima
> 🔹 dono | bot
> 🔹 ping | ping2
> 🔹 toimg | fs

 *DOWNLOADS*
> 🎵 play
> 🎬 playvd
> 🎶 videoaudio

 *INFORMAÇÕES*
> 📑 infocookie
> 📑 infogp
> 💭 ideia
-------------------------
`;
    await sock.sendMessage(from, {
      text: menuText,
      mentions: [sender],
      contextInfo: {
        mentionedJid: [sender],
        externalAdReply: {
          title: '🌌 MENU INICIAL ✨',
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
    console.error('Erro ao enviar menu:', err.message);
    await sock.sendMessage(from, { text: '❌ Erro ao carregar menu.' }, { quoted: msg });
  }
};