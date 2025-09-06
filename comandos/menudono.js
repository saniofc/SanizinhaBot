const axios = require('axios');
const { nomebot } = require('../dono/info.json');
const fs = require('fs');
module.exports = async function menuDonoCommand(msg, sock, from) {
  try {
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid || from;
    const userTag = `@${sender.split('@')[0]}`;
    const donoRaw = JSON.parse(fs.readFileSync('./dono/info.json', 'utf-8')).numerodono;
    const dono = donoRaw.replace(/\D/g, '');
    if (!sender.includes(dono)) {
      await sock.sendMessage(from, {
        text: '❌ Apenas o dono do bot pode usar este comando.'
      }, { quoted: msg });
      return;
    }
    await sock.sendMessage(from, { react: { text: '👑', key: msg.key } });
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(from, 'image');
    } catch {
      ppUrl = 'https://files.catbox.moe/1716db.jpg';
    }
    const thumbnail = await axios.get(ppUrl, { responseType: 'arraybuffer' }).then(res => res.data);
    const lermais = '\u200E'.repeat(4501);
    const menuDonoText = `~✦ ❍✦ ❍✦ ✰ ✦❍ ✦❍ ✦~
│𝗕𝗲𝗺 𝘃𝗶𝗻𝗱𝗼 ${userTag}
~✦ ❍✦ ❍✦ ✰ ✦❍ ✦❍ ✦~
${lermais}

💎 COMANDOS-DONO
> 💎 ► reiniciar
> 💎 ► nuke
> 💎 ► entrargp
> 💎 ► delvip
> 💎 ► addvip
> 💎 ► listavip
> 💎 ► sairgp
> 💎 ► tmss
> 💎 ► idgp
> 💎 ► addcmdvip
> 💎 ► delcmdvip
> 💎 ► novodono
> 💎 ► banghost
> 💎 ► antipromote
> 💎 ► bloock
> 💎 ► unbloock
> 💎 ► listblock
> 💎 ► nomebot
> 💎 ► botoff / boton
~✦      ★      𝑺𝒂𝒏𝒊𝒛𝒊𝒏𝒉𝒂𝑩𝒐𝒕      ★     ✦~`;
    await sock.sendMessage(from, {
      text: menuDonoText,
      mentions: [sender],
      contextInfo: {
        mentionedJid: [sender],
        externalAdReply: {
          title: '👑 𝗠𝗘𝗡𝗨 𝗗𝗢𝗡𝗢 👑',
          body: `❤️‍🔥 ${nomebot}`,
          mediaType: 1,
          previewType: 'PHOTO',
          renderLargerThumbnail: false,
          thumbnail,
          mediaUrl: 'https://nexosofc',
          sourceUrl: 'https://nexosofc'
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error('Erro ao enviar menuDono:', err.message);
    await sock.sendMessage(from, {
      text: '❌ Erro ao carregar menu do dono.'
    }, { quoted: msg });
  }
};