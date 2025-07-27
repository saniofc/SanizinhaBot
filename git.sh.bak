#!/bin/bash
echo "📦 Adicionando arquivos..."
git add .
echo "✏️ Escreva a mensagem do commit:"
read mensagem
git commit -m "$mensagem"
echo "🚀 Enviando para o GitHub (forçado)..."
git push origin main --force
echo "✅ Atualização enviada com sucesso!"