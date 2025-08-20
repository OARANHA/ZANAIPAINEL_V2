# Configuração de APIs para o Sistema Flowise

Este documento explica como configurar as APIs de LLM necessárias para o funcionamento dos agentes no sistema.

## 🚨 Importante: Segurança das Chaves de API

As chaves de API são informações sensíveis e **NUNCA** devem ser commitadas no repositório. Use sempre variáveis de ambiente.

## 🔑 Configuração das APIs

### 1. OpenAI API

Para usar a API da OpenAI:

1. **Obtenha sua API Key**:
   - Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Crie uma nova API key
   - Copie a chave gerada

2. **Configure a variável de ambiente**:
   ```bash
   # No arquivo .env.local
   OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui
   ```

### 2. Z.AI API

Para usar a API da Z.AI:

1. **Obtenha sua API Key**:
   - A chave fornecida: `d56c89e3fdd24034bd228576e2f40fd5.zfVpIPTnS55T9qRE`
   - Base URL: `https://api.z.ai/api/paas/v4/`

2. **Configure a variável de ambiente**:
   ```bash
   # No arquivo .env.local
   ZAI_API_KEY=d56c89e3fdd24034bd228576e2f40fd5.zfVpIPTnS55T9qRE
   ```

### 3. Google Search API (Opcional)

Para usar ferramentas de busca nos agentes:

1. **Configure a Google Custom Search API**:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Habilite a "Custom Search API"
   - Crie credenciais de API

2. **Configure o Search Engine ID**:
   - Acesse [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Crie um novo motor de busca
   - Copie o Search engine ID

3. **Configure as variáveis de ambiente**:
   ```bash
   # No arquivo .env.local
   GOOGLE_API_KEY=sua-chave-google-api-aqui
   GOOGLE_SEARCH_ENGINE_ID=seu-search-engine-id-aqui
   ```

## 📁 Arquivo de Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o arquivo com suas chaves
nano .env.local
```

Exemplo de `.env.local`:

```env
# OpenAI API
OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui

# Z.AI API
ZAI_API_KEY=sua-chave-z-ai-aqui

# Google Search API (opcional)
GOOGLE_API_KEY=sua-chave-google-api-aqui
GOOGLE_SEARCH_ENGINE_ID=seu-search-engine-id-aqui

# Outras configurações
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000
```

## 🔧 Como o Sistema Usa as APIs

### 1. Gerenciamento de Configuração

O sistema usa o `ApiConfigManager` para gerenciar múltiplos provedores:

```typescript
import { apiConfigManager } from '@/lib/api-config';

// Obter provedores ativos
const providers = apiConfigManager.getActiveProviders();

// Obter provedor padrão
const defaultProvider = apiConfigManager.getDefaultProvider();

// Testar conexão
const isConnected = await apiConfigManager.testConnection('openai');
```

### 2. Geração de Configurações Flowise

As APIs são usadas para configurar os nodes LLM nos workflows:

```typescript
// Exemplo de configuração gerada
{
  "nodes": [
    {
      "id": "llm",
      "type": "OpenAI",
      "data": {
        "apiKey": process.env.OPENAI_API_KEY,
        "baseUrl": "https://api.openai.com/v1/",
        "modelName": "gpt-4",
        "temperature": 0.7
      }
    }
  ]
}
```

### 3. Tipos de Agentes Suportados

#### Chat Simples
- Usa apenas o node LLM
- Configuração básica de temperatura e tokens

#### RAG (Retrieval-Augmented Generation)
- Usa nodes de documentos, embeddings e vector store
- Configuração de busca e contexto

#### Assistente com Ferramentas
- Usa nodes de ferramentas (calculator, search)
- Configuração de múltiplas APIs

## 🧪 Testando as Configurações

### 1. Testar Conexão com APIs

Use a página de teste para verificar as configurações:

```bash
# Acesse a página de teste
http://localhost:3000/test-agent
```

### 2. Verificar Status das APIs

O sistema mostra o status de cada provedor:

- ✅ **Ativo**: API configurada e funcionando
- ❌ **Inativo**: API não configurada ou com erro
- ⚠️ **Testando**: Verificando conexão

### 3. Testar Agentes

Execute os testes automáticos para validar:

- Geração de configurações
- Validação de workflows
- Integração com APIs

## 🔍 Resolução de Problemas

### 1. Erro: "Nenhum provedor de API configurado"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
```bash
# Verifique se o arquivo .env.local existe
ls -la .env.local

# Se não existir, crie a partir do exemplo
cp .env.example .env.local

# Edite o arquivo com suas chaves
```

### 2. Erro: "API key inválida"

**Causa**: Chave de API incorreta ou expirada

**Solução**:
- Verifique a chave no provedor (OpenAI/Z.AI)
- Gere uma nova chave se necessário
- Atualize o arquivo `.env.local`

### 3. Erro: "Conexão recusada"

**Causa**: Problemas de rede ou baseURL incorreta

**Solução**:
- Verifique a conexão com a internet
- Confirme as URLs das APIs
- Teste manualmente com curl:

```bash
# Testar OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Testar Z.AI
curl -H "Authorization: Bearer $ZAI_API_KEY" https://api.z.ai/api/paas/v4/models
```

### 4. Erro: "Modelo não encontrado"

**Causa**: Nome do modelo incorreto ou não disponível

**Solução**:
- Verifique os modelos disponíveis no provedor
- Use um dos modelos suportados:
  - OpenAI: `gpt-4`, `gpt-4-turbo`, `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
  - Z.AI: `gpt-4`, `gpt-4-turbo`, `gpt-4o`, `gpt-3.5-turbo`

## 🚀 Próximos Passos

1. **Configure as variáveis de ambiente**
2. **Reinicie o servidor de desenvolvimento**
3. **Acesse a página de teste**
4. **Execute os testes automáticos**
5. **Crie seus primeiros agentes**

## 📚 Documentação Adicional

- [Documentação do Flowise](https://docs.flowiseai.com/)
- [Documentação da OpenAI API](https://platform.openai.com/docs/api-reference)
- [Documentação da Z.AI](https://docs.z.ai/)
- [Guia de Variáveis de Ambiente Next.js](https://nextjs.org/docs/basic-features/environment-variables)

---

**Lembre-se**: Nunca commit suas chaves de API no repositório! Use sempre variáveis de ambiente.