// NÃO MEXA AQUI PRA NÃO DAR MERDA!
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const colors = require('colors');
const gradient = require('gradient-string');
const readline = require('readline');
const { exec } = require('child_process');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { upsert, onGroupParticipantsUpdate, setSock } = require('./index.js');
const number = process.env.WHATSAPP_NUMBER || 'default';
const qrcodePath = `./dados/sessoes/session-${number}`;
const pairingCode = process.argv.includes("--code");
const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(text, answer => {
      rl.close();
      resolve(answer);
    });
  });
};
let reconnecting = false;
async function STBLK() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(qrcodePath);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: 'silent' }),
      browser: ['Ubuntu', 'Edge', '110.0.1587.56'],
    });
    setSock(sock);
    sock.ev.on('messages.upsert', async (m) => {
      try {
        const msg = m.messages[0];
        if (!msg || !msg.message || msg.message.protocolMessage) return;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const pushName = msg.pushName || 'Usuário';
        const isGroup = from.endsWith('@g.us');
        const tipo = Object.keys(msg.message)[0];
        const nomeGrupoOuPrivado = isGroup
          ? (await sock.groupMetadata(from)).subject
          : 'Privado';
        let conteudoMsg = '';
        switch (tipo) {
          case 'conversation':
            conteudoMsg = msg.message.conversation;
            break;
          case 'extendedTextMessage':
            conteudoMsg = msg.message.extendedTextMessage.text;
            break;
          case 'imageMessage':
            conteudoMsg = '📷 Foto';
            break;
          case 'videoMessage':
            conteudoMsg = '🎥 Vídeo';
            break;
          case 'stickerMessage':
            conteudoMsg = '🧩 Figurinha';
            break;
          case 'audioMessage':
            conteudoMsg = '🎧 Áudio';
            break;
          case 'documentMessage':
            conteudoMsg = '📄 Documento';
            break;
          case 'contactMessage':
            conteudoMsg = '👤 Contato';
            break;
          default:
            conteudoMsg = `[${tipo}]`;
        }
        console.log(colors.green('\n=========================='));
        console.log(`${chalk.cyan.bold(nomeGrupoOuPrivado)}`);
        console.log(`${chalk.yellow.bold('@')}${sender.split('@')[0]} (${pushName})`);
        console.log(`${chalk.whiteBright(conteudoMsg)}`);
        console.log(colors.green('=========================='));
        await upsert(m, sock);
      } catch (e) {
        console.error('Erro no messages.upsert:', e);
      }
    });
    sock.ev.on('group-participants.update', async (update) => {
      try {
        await onGroupParticipantsUpdate(update, sock);
        const { id: groupId, participants, action } = update;
        if (action === 'remove') {
          const contadorPath = './dados/contador.json';
          if (!fs.existsSync(contadorPath)) return;
          let contador = JSON.parse(fs.readFileSync(contadorPath, 'utf-8'));
          if (typeof contador !== 'object') return;
          for (const user of participants) {
            if (contador[groupId]?.[user]) {
              delete contador[groupId][user];
            }
            if (contador[groupId] && Object.keys(contador[groupId]).length === 0) {
              delete contador[groupId];
            }
          }
          fs.writeFileSync(contadorPath, JSON.stringify(contador, null, 2));
        }
      } catch (e) {
        console.error('Erro em group-participants.update:', e);
      }
    });
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr && !pairingCode) {
        console.log('\n📷 Escaneie o QR code abaixo:\n');
        require('qrcode-terminal').generate(qr, { small: true });
      }
      if (connection === 'close') {
        const reason = lastDisconnect?.error;
        const statusCode = new Boom(reason)?.output?.statusCode;
        console.log(colors.red('Conexão fechada! Motivo:'), reason);
        console.log(colors.red('Código de status:'), statusCode);
        if (reconnecting) {
          console.log(colors.yellow('Já está tentando reconectar, ignorando chamada duplicada.'));
          return;
        }
        reconnecting = true;
        if (statusCode !== DisconnectReason.loggedOut) {
          console.log(colors.yellow('Tentando reconectar em 5 segundos...'));
          await new Promise(resolve => setTimeout(resolve, 5000));
          try {
            await STBLK();
          } catch (err) {
            console.error('Erro ao tentar reconectar:', err);
          }
          reconnecting = false;
        } else {
          console.log(colors.red("Sessão encerrada pelo logout. Excluindo diretório de sessão..."));
          exec(`rm -rf ${qrcodePath}`, (err) => {
            if (err) console.error('Erro ao excluir sessão:', err);
            process.exit(0);
          });
        }
      }
      else if (connection === 'open') {
        reconnecting = false;
        const texto = `
░██████╗░█████╗░███╗░░██╗██╗███████╗██╗███╗░░██╗██╗░░██╗░█████╗░
██╔════╝██╔══██╗████╗░██║██║╚════██║██║████╗░██║██║░░██║██╔══██╗
╚█████╗░███████║██╔██╗██║██║░░███╔═╝██║██╔██╗██║███████║███████║
░╚═══██╗██╔══██║██║╚████║██║██╔══╝░░██║██║╚████║██╔══██║██╔══██║
██████╔╝██║░░██║██║░╚███║██║███████╗██║██║░╚███║██║░░██║██║░░██║
╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚══════╝╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝
                        ██╗░░░██╗░░░███╗
                        ██║░░░██║░░█████║
                        ╚██╗░██╔╝░╚██╔██║
                        ░╚████╔╝░░░╚═╝██║
                        ░░╚██╔╝░░░███████║
                        ░░░╚═╝░░░░╚══════╝`;
        const usernameBot = process.env.BOT_NAME || "SanizinhaBot";
        console.log(gradient.pastel.multiline(texto));
        console.log(chalk.yellow(`*ੈ🌸‧₊˚Sistema conectado com sucesso°❀⋆.ೃ࿔*･!`));
        console.log(chalk.magenta(`💻 Desenvolvido por ${chalk.bold('@saniofc°❀⋆.ೃ࿔*:･')}`));
        console.log('');
      }
    });
    if (pairingCode && !sock.authState.creds.registered) {
      let phoneNumber = await question("Digite o número do bot (sem + e sem espaços): ");
      phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      let code = await sock.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log("🔗 Código de pareamento:", code);
    }
    sock.ev.on('creds.update', saveCreds);
  } catch (err) {
    console.error('Erro geral na inicialização do bot:', err);
  }
}
STBLK().catch(e => console.error("Erro ao iniciar o bot:", e));