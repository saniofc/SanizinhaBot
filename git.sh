#!/bin/bash

# Caminho correto do seu repo
cd /sdcard/Sanizinhafc || { echo "Diretório não encontrado"; exit 1; }

echo "📦 Adicionando arquivos..."
git add .
echo "✏️ Escreva a mensagem do commit:"
read mensagem
git commit -m "$mensagem"
echo "🚀 Enviando para o GitHub (forçado)..."
git push origin main --force
echo "✅ Atualização enviada com sucesso!"