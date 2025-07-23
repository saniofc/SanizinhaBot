const fs = require('fs');
const path = require('path');
const gruposDir = './dados/grupos';
function carregarConfigGrupo(grupoId, nomeGrupo = '') {
  const file = path.join(gruposDir, `${grupoId}.json`);
  const configPadrao = {
    nome: nomeGrupo || '',
    listanegra: [],
    antilink: false,
    antipromote: false,
    antiporno: false,
    antifake: false,
    antitrava: false,
    blockgp: false,
    sania: false,
    bemvindo: false,
    legendabv: "💕Oiê #membro#"
  };
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(configPadrao, null, 2));
    return configPadrao;
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    data.listanegra = data.listanegra || [];
    data.antilink = !!data.antilink;
    data.antipromote = !!data.antipromote;
    data.antiporno = !!data.antiporno;
    data.antifake = !!data.antifake;
    data.antitrava = !!data.antitrava;
    data.blockgp = !!data.blockgp;
    data.sania = !!data.sania;
    data.bemvindo = !!data.bemvindo;
    data.legendabv = data.legendabv || "💕Oiê #membro#";
    if (nomeGrupo && data.nome !== nomeGrupo) {
      data.nome = nomeGrupo;
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
    return data;
  } catch (e) {
    console.error(`Erro ao carregar config grupo ${grupoId}:`, e);
    fs.writeFileSync(file, JSON.stringify(configPadrao, null, 2));
    return configPadrao;
  }
}
function salvarConfigGrupo(grupoId, config) {
  const file = path.join(gruposDir, `${grupoId}.json`);
  if (!fs.existsSync(gruposDir)) fs.mkdirSync(gruposDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}
module.exports = {
  carregarConfigGrupo,
  salvarConfigGrupo
};