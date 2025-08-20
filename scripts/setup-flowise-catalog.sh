#!/bin/bash

# Script para configurar o catálogo de nodes do Flowise
echo "=== Configurando Catálogo de Nodes do Flowise ==="

# 1. Clone do Flowise (se não existir)
if [ ! -d "Flowise" ]; then
    echo "1. Clonando repositório do Flowise..."
    git clone https://github.com/FlowiseAI/Flowise.git
else
    echo "1. Repositório Flowise já existe, pulando clone..."
fi

# 2. Verificar se o diretório nodes existe
if [ ! -d "Flowise/packages/components/nodes" ]; then
    echo "ERRO: Diretório de nodes não encontrado!"
    echo "Por favor, verifique se o clone foi bem sucedido."
    exit 1
fi

# 3. Executar o script de catalogação
echo "2. Executando script de catalogação de nodes..."
node scripts/catalog-flowise-nodes.mjs

# 4. Verificar resultados
if [ -f "catalog.flowise.nodes.json" ] && [ -f "catalog.flowise.nodes.md" ]; then
    echo "3. ✅ Catálogo gerado com sucesso!"
    echo "   - catalog.flowise.nodes.json"
    echo "   - catalog.flowise.nodes.md"
    
    # Mostrar estatísticas básicas
    if command -v jq &> /dev/null; then
        total_nodes=$(jq length catalog.flowise.nodes.json)
        echo "   - Total de nodes: $total_nodes"
        
        # Mostrar categorias
        echo "   - Categorias encontradas:"
        jq -r '.[].categoria' catalog.flowise.nodes.json | sort | uniq -c | sort -nr
    fi
else
    echo "3. ❌ Falha ao gerar catálogo"
    exit 1
fi

echo ""
echo "=== Setup concluído! ==="