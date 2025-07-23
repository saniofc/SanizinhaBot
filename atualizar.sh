#!/bin/sh

# Cores
GREEN='\033[1;32m'
BLUE='\033[1;34m'
NC='\033[0m'

clear
printf "${BLUE}────────────❍❍❍❍🩸❍❍❍❍───────────\n"
printf "${GREEN}         ⌛  Atualizando Sanizinha  ⌛    \n"
printf "${BLUE}────────────❍❍❍❍🩸❍❍❍❍───────────${NC}\n"
sleep 1

# Define pasta
BOT_DIR="/storage/emulated/0/SanizinhaBot"

# Adiciona exceção para o diretório
git config --global --add safe.directory "$BOT_DIR"

# Vai para a pasta do bot
cd "$BOT_DIR" || exit

# Baixa alterações do repositório remoto
git fetch origin

# Reseta o conteúdo local para o remoto
git reset --hard origin/main

# Remove arquivos específicos que não devem vir
rm -f git.sh README.md

# Remove a pasta .git para evitar rastreamento do Git
rm -rf .git

# Limpa arquivos não rastreados
git clean -fd

# Mensagem final
printf "${GREEN}✅ BOT ATUALIZADO COM SUCESSO😻💕✨${NC}\n"
printf "${BLUE}🚀 Iniciando o bot...${NC}\n"

# Inicia o bot
sh sani.sh