const axios = require('axios');
const { nomebot } = require('../dono/info.json');
module.exports = async function menuAdmCommand(msg, sock, from) {
  try {
    const sender = msg.key.participant || msg.participant || msg.key.remoteJid || from;
    const userTag = `@${sender.split('@')[0]}`;
    const groupMetadata = await sock.groupMetadata(from);
    const isAdmin = groupMetadata.participants?.some(p =>
      p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (!isAdmin) {
      await sock.sendMessage(from, {
        text: '❌ Apenas administradores podem usar este comando.'
      }, { quoted: msg });
      return;
    }
    await sock.sendMessage(from, { react: { text: '🙇🏻‍♀️', key: msg.key } });
    let ppUrl;
    try {
      ppUrl = await sock.profilePictureUrl(from, 'image');
    } catch {
      ppUrl = 'https://files.catbox.moe/1716db.jpg';
    }
    const thumbnail = await axios.get(ppUrl, { responseType: 'arraybuffer' }).then(res => res.data);
    const lermais = '\u200E'.repeat(4000);
    const menuAdmText = `
☆.  × ✦  ☆°. * ✦°. × ☆ 
_💖 𝔹𝕖𝕞 𝕧𝕚𝕟𝕕𝕠 ✨_
${userTag}
----------------------------
${lermais}
 *COMANDOS-ADM*
> ✰ gpa 7h 30m
> ✰ gpf 23h 59m
> ✰ A abrir / F fecha
> ✰ ban / b / bam
> ✰ marca / cita
> ✰ linkgp
> ✰ mute
> ✰ listanegra
> ✰ tirardalista
> ✰ verlista
> ✰ desmute
> ✰ revelar
> ✰ antilink
> ✰ antitrava
> ✰ antiloc
> ✰ antiporno
> ✰ antifake
> ✰ antifigu
> ✰ limpaadv
> ✰ tiraradadv
> ✰ bemvindo
> ✰ legendabv
> ✰ limpar
> ✰ limparank
> ✰ limparank2
> ✰ blockgp
> ✰ ghosts
> ✰ totag
> ✰ adv
> ✰ del
> ✰ avt
--------------------------
`;
    await sock.sendMessage(from, {
      text: menuAdmText,
      mentions: [sender],
      contextInfo: {
        mentionedJid: [sender],
        externalAdReply: {
          title: '👑 𝗠𝗘𝗡𝗨 𝗔𝗗𝗠 👑',
          body: `❤️‍🔥 ${nomebot}`,
          mediaType: 1,
          previewType: 'PHOTO',
          thumbnail,
          mediaUrl: 'https://nexosofc',
          sourceUrl: 'https://nexosofc'
        }
      }
    }, { quoted: msg });
  } catch (err) {
    console.error('Erro ao enviar menuAdm:', err.message);
    await sock.sendMessage(from, {
      text: '❌ Erro ao carregar menu de administrador.'
    }, { quoted: msg });
  }
};