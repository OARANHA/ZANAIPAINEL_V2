# Guia Completo das APIs Flowise para Projeto Zania

**Versão:** 2.0.0  
**Última Atualização:** 20/08/2025  
**Projeto:** Zania AI Platform

## Introdução

Este guia serve como referência completa para integração com as APIs Flowise no projeto Zania. A ideia principal é estabelecer comunicação bidirecional com Flowise, permitindo buscar informações e enviar dados para processamento.

**Escopo:** Cobre todos os endpoints principais para comunicação bidirecional com Flowise  
**Público Alvo:** Desenvolvedores do projeto Zania  
**Objetivo:** Criar uma referência permanente que não precise consultar links externos

## Índice

1. [Arquitetura de Integração](#arquitetura-de-integração)
2. [Padrões de Integração](#padrões-de-integração)
3. [Melhores Práticas](#melhores-práticas)
4. [APIs Flowise Detalhadas](#apis-flowise-detalhadas)
5. [Exemplos de Implementação](#exemplos-de-implementação)
6. [Clientes Específicos](#clientes-específicos)
7. [Padrões de Resposta](#padrões-de-resposta)
8. [Tratamento de Erros](#tratamento-de-erros)

---

## Arquitetura de Integração

### Visão Geral
```
Zania Platform ←→ Flowise APIs ←→ Flowise Engine
     ↓                    ↓                ↓
  Frontend          API Clients        Workflow Engine
  Interface         (TypeScript)        (Processing)
```

### Fluxo de Comunicação
1. **Zania → Flowise**: Envio de dados para processamento
2. **Flowise → Zania**: Retorno de resultados e metadados
3. **Bidirecional**: Sincronização de estado e configurações

---

## Padrões de Integração

### Autenticação
- **Tipo:** API Key Bearer Token
- **Header:** Authorization
- **Formato:** `Bearer ${API_KEY}`
- **Variável de Ambiente:** `FLOWISE_API_KEY`

### URLs Base
```typescript
const BASE_URLS = {
  local: 'http://localhost:3000',
  development: 'https://api.flowiseai.com',
  production: process.env.FLOWISE_BASE_URL || 'https://api.flowiseai.com'
};
```

### Headers Padrão
```typescript
const DEFAULT_HEADERS = {
  'Authorization': `Bearer ${process.env.FLOWISE_API_KEY}`,
  'Content-Type': 'application/json',
  'User-Agent': 'Zania-Platform/2.0.0'
};
```

### Tratamento de Erros
- **Estratégia de Retry:** Exponential backoff
- **Timeout:** 30 seconds (configurável)
- **Máximo de Retries:** 3
- **Circuit Breaker:** Implementado para falhas em cascata

### Formatos de Dados
- **Requisição:** JSON
- **Resposta:** JSON
- **Encoding:** UTF-8
- **Compression:** gzip (opcional)

---

## Melhores Práticas

### Segurança
- ✅ Sempre use HTTPS em produção
- ✅ Nunca exponha chaves de API no frontend
- ✅ Implemente rate limiting
- ✅ Valide todos os dados de entrada
- ✅ Use variáveis de ambiente para credenciais
- ✅ Implemente logging seguro (sem dados sensíveis)

### Performance
- ✅ Use conexões keep-alive
- ✅ Implemente cache para respostas frequentes
- ✅ Processe respostas de forma assíncrona
- ✅ Monitore tempos de resposta
- ✅ Use batching para múltiplas requisições
- ✅ Implemente lazy loading para grandes datasets

### Confiabilidade
- ✅ Implemente retry com exponential backoff
- ✅ Use circuit breaker para falhas em cascata
- ✅ Logue todas as requisições e respostas
- ✅ Monitore saúde da API
- ✅ Implemente health checks
- ✅ Use filas para processamento assíncrono

### Monitoramento
- ✅ Métricas de tempo de resposta
- ✅ Taxa de sucesso/falha
- ✅ Uso de recursos
- ✅ Alertas para anomalias

---

## APIs Flowise Detalhadas

### 1. Assistants API

**Propósito:** Gerenciar assistentes virtuais especializados

#### Endpoints
```typescript
// Listar todos os assistentes
GET /api/v1/assistants

// Criar novo assistente
POST /api/v1/assistants

// Obter assistente específico
GET /api/v1/assistants/{id}

// Atualizar assistente
PUT /api/v1/assistants/{id}

// Deletar assistente
DELETE /api/v1/assistants/{id}

// Executar assistente
POST /api/v1/assistants/{id}/execute
```

#### Estrutura de Dados
```typescript
interface Assistant {
  id: string;
  name: string;
  description: string;
  type: 'chat' | 'tool' | 'composed' | 'knowledge';
  configuration: AssistantConfig;
  status: 'active' | 'inactive' | 'training';
  createdAt: string;
  updatedAt: string;
}

interface AssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools?: string[];
  knowledgeBase?: string;
}
```

#### Casos de Uso no Zania
- Criar assistentes especializados por domínio
- Gerenciar configurações de agentes IA
- Integrar com sistemas existentes
- Executar tarefas específicas

#### Exemplo de Integração
```typescript
// src/lib/flowise-assistants-client.ts
export class FlowiseAssistantsClient extends FlowiseBaseClient {
  async createAssistant(data: CreateAssistantRequest): Promise<Assistant> {
    return this.request('POST', '/api/v1/assistants', data);
  }

  async listAssistants(): Promise<Assistant[]> {
    return this.request('GET', '/api/v1/assistants');
  }

  async executeAssistant(id: string, input: ExecuteInput): Promise<ExecuteResponse> {
    return this.request('POST', `/api/v1/assistants/${id}/execute`, input);
  }
}
```

---

### 2. Attachments API

**Propósito:** Gerenciar anexos de documentos em conversas

#### Endpoints
```typescript
// Upload de anexo
POST /api/v1/attachments/upload

// Listar anexos
GET /api/v1/attachments

// Obter anexo específico
GET /api/v1/attachments/{id}

// Deletar anexo
DELETE /api/v1/attachments/{id}

// Processar anexo
POST /api/v1/attachments/{id}/process
```

#### Estrutura de Dados
```typescript
interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  processed: boolean;
  content?: string; // Para arquivos de texto
  metadata: AttachmentMetadata;
}

interface AttachmentMetadata {
  extractedText?: string;
  pageCount?: number;
  language?: string;
  entities?: Entity[];
}
```

#### Casos de Uso no Zania
- Anexar documentos a conversas
- Processar diferentes tipos de arquivos (PDF, DOCX, TXT)
- Extrair texto e metadados
- Gerenciar armazenamento de anexos

#### Exemplo de Integração
```typescript
// src/lib/flowise-attachments-client.ts
export class FlowiseAttachmentsClient extends FlowiseBaseClient {
  async uploadAttachment(file: File, metadata?: any): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    // Upload multipart/form-data
    const response = await fetch(`${this.baseUrl}/api/v1/attachments/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });
    
    return response.json();
  }

  async processAttachment(id: string, options: ProcessOptions): Promise<ProcessResult> {
    return this.request('POST', `/api/v1/attachments/${id}/process`, options);
  }
}
```

---

### 3. Document Store API

**Propósito:** Gerenciar armazenamento e recuperação de documentos

#### Endpoints
```typescript
// Adicionar documento ao store
POST /api/v1/documents/upsert

// Buscar documentos
GET /api/v1/documents/search

// Listar documentos
GET /api/v1/documents

// Obter documento específico
GET /api/v1/documents/{id}

// Deletar documento
DELETE /api/v1/documents/{id}

// Atualizar documento
PUT /api/v1/documents/{id}
```

#### Estrutura de Dados
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  embeddings?: number[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentMetadata {
  source: string;
  author?: string;
  tags?: string[];
  category?: string;
  language?: string;
}
```

#### Casos de Uso no Zania
- Armazenar documentos para recuperação
- Indexar conteúdo para busca semântica
- Gerenciar bases de conhecimento
- Implementar RAG (Retrieval-Augmented Generation)

#### Exemplo de Integração
```typescript
// src/lib/flowise-document-store-client.ts
export class FlowiseDocumentStoreClient extends FlowiseBaseClient {
  async upsertDocument(data: UpsertDocumentRequest): Promise<Document> {
    return this.request('POST', '/api/v1/documents/upsert', data);
  }

  async searchDocuments(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const params = new URLSearchParams({ query });
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }
    
    return this.request('GET', `/api/v1/documents/search?${params.toString()}`);
  }
}
```

---

### 4. Leads API

**Propósito:** Capturar e gerenciar leads gerados em conversas

#### Endpoints
```typescript
// Criar lead
POST /api/v1/leads

// Listar leads
GET /api/v1/leads

// Obter lead específico
GET /api/v1/leads/{id}

// Atualizar lead
PUT /api/v1/leads/{id}

// Qualificar lead
POST /api/v1/leads/{id}/qualify

// Converter lead em cliente
POST /api/v1/leads/{id}/convert
```

#### Estrutura de Dados
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'qualified' | 'converted' | 'lost';
  score: number;
  source: string;
  metadata: LeadMetadata;
  createdAt: string;
  updatedAt: string;
}

interface LeadMetadata {
  conversationId?: string;
  interests?: string[];
  budget?: string;
  timeline?: string;
  notes?: string;
}
```

#### Casos de Uso no Zania
- Capturar leads de conversas
- Qualificar leads automaticamente
- Integrar com sistemas CRM
- Gerar relatórios de conversão

#### Exemplo de Integração
```typescript
// src/lib/flowise-leads-client.ts
export class FlowiseLeadsClient extends FlowiseBaseClient {
  async createLead(data: CreateLeadRequest): Promise<Lead> {
    return this.request('POST', '/api/v1/leads', data);
  }

  async qualifyLead(id: string, criteria: QualificationCriteria): Promise<Lead> {
    return this.request('POST', `/api/v1/leads/${id}/qualify`, criteria);
  }

  async convertLead(id: string, conversionData: ConversionData): Promise<Customer> {
    return this.request('POST', `/api/v1/leads/${id}/convert`, conversionData);
  }
}
```

---

### 5. Ping API

**Propósito:** Verificar saúde e disponibilidade da API

#### Endpoints
```typescript
// Health check básico
GET /api/v1/ping

// Health check detalhado
GET /api/v1/health

// Status de serviços
GET /api/v1/status
```

#### Estrutura de Resposta
```typescript
interface PingResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down';
    cache: 'up' | 'down';
    ai: 'up' | 'down';
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}
```

#### Casos de Uso no Zania
- Monitorar disponibilidade da API
- Verificar saúde dos serviços
- Implementar health checks automáticos
- Dashboard de monitoramento

#### Exemplo de Integração
```typescript
// src/lib/flowise-ping-client.ts
export class FlowisePingClient extends FlowiseBaseClient {
  async ping(): Promise<PingResponse> {
    return this.request('GET', '/api/v1/ping');
  }

  async health(): Promise<HealthResponse> {
    return this.request('GET', '/api/v1/health');
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.health();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }
}
```

---

### 6. Prediction API

**Propósito:** Fazer previsões e obter respostas de modelos de IA

#### Endpoints
```typescript
// Fazer previsão
POST /api/v1/prediction

// Previsão em batch
POST /api/v1/prediction/batch

// Obter histórico de previsões
GET /api/v1/prediction/history

// Obter previsão específica
GET /api/v1/prediction/{id}
```

#### Estrutura de Dados
```typescript
interface PredictionRequest {
  input: string | Record<string, any>;
  model?: string;
  parameters?: PredictionParameters;
  context?: PredictionContext;
}

interface PredictionResponse {
  id: string;
  output: any;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
  metadata: PredictionMetadata;
}

interface PredictionParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}
```

#### Casos de Uso no Zania
- Fazer previsões com modelos de IA
- Processar entrada de texto
- Obter respostas estruturadas
- Implementar chatbots e assistentes

#### Exemplo de Integração
```typescript
// src/lib/flowise-prediction-client.ts
export class FlowisePredictionClient extends FlowiseBaseClient {
  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    return this.request('POST', '/api/v1/prediction', data);
  }

  async batchPredict(data: PredictionRequest[]): Promise<PredictionResponse[]> {
    return this.request('POST', '/api/v1/prediction/batch', data);
  }

  async streamPredict(data: PredictionRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/api/v1/prediction`, {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data)
    });
    
    return response.body as ReadableStream;
  }
}
```

---

### 7. Tools API

**Propósito:** Gerenciar e executar ferramentas externas

#### Endpoints
```typescript
// Listar ferramentas disponíveis
GET /api/v1/tools

// Executar ferramenta
POST /api/v1/tools/{toolName}/execute

// Obter definição da ferramenta
GET /api/v1/tools/{toolName}

// Registrar nova ferramenta
POST /api/v1/tools/register

// Atualizar ferramenta
PUT /api/v1/tools/{toolName}
```

#### Estrutura de Dados
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returnType: string;
  category: 'api' | 'database' | 'file' | 'custom';
  version: string;
  author: string;
}

interface ToolExecution {
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  executionTime: number;
  status: 'success' | 'error' | 'timeout';
}
```

#### Casos de Uso no Zania
- Executar ferramentas externas
- Integrar com APIs de terceiros
- Automatizar tarefas
- Extender funcionalidades do sistema

#### Exemplo de Integração
```typescript
// src/lib/flowise-tools-client.ts
export class FlowiseToolsClient extends FlowiseBaseClient {
  async listTools(): Promise<Tool[]> {
    return this.request('GET', '/api/v1/tools');
  }

  async executeTool(toolName: string, parameters: Record<string, any>): Promise<ToolExecution> {
    return this.request('POST', `/api/v1/tools/${toolName}/execute`, { parameters });
  }

  async registerTool(tool: ToolDefinition): Promise<Tool> {
    return this.request('POST', '/api/v1/tools/register', tool);
  }
}
```

---

### 8. Upsert History API

**Propósito:** Gerenciar histórico de atualizações e mudanças

#### Endpoints
```typescript
// Listar histórico
GET /api/v1/upsert-history

// Obter registro específico
GET /api/v1/upsert-history/{id}

// Buscar por entidade
GET /api/v1/upsert-history/entity/{entityType}/{entityId}

// Reverter alteração
POST /api/v1/upsert-history/{id}/revert
```

#### Estrutura de Dados
```typescript
interface UpsertHistory {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  timestamp: string;
  user: string;
  metadata: Record<string, any>;
}
```

#### Casos de Uso no Zania
- Histórico de atualizações
- Rastrear mudanças
- Auditoria de dados
- Reversão de alterações

#### Exemplo de Integração
```typescript
// src/lib/flowise-upsert-history-client.ts
export class FlowiseUpsertHistoryClient extends FlowiseBaseClient {
  async getHistory(entityType: string, entityId: string): Promise<UpsertHistory[]> {
    return this.request('GET', `/api/v1/upsert-history/entity/${entityType}/${entityId}`);
  }

  async revertChange(id: string): Promise<UpsertHistory> {
    return this.request('POST', `/api/v1/upsert-history/${id}/revert`);
  }
}
```

---

### 9. Variables API

**Propósito:** Gerenciar variáveis de sessão e contexto

#### Endpoints
```typescript
// Definir variável
POST /api/v1/variables/set

// Obter variável
GET /api/v1/variables/{key}

// Listar variáveis
GET /api/v1/variables

// Deletar variável
DELETE /api/v1/variables/{key}

// Limpar todas as variáveis
DELETE /api/v1/variables/clear
```

#### Estrutura de Dados
```typescript
interface Variable {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  scope: 'session' | 'user' | 'global';
  ttl?: number; // Time to live em segundos
  createdAt: string;
  updatedAt: string;
}
```

#### Casos de Uso no Zania
- Gerenciar variáveis de sessão
- Armazenar contexto
- Personalizar respostas
- Manter estado entre conversas

#### Exemplo de Integração
```typescript
// src/lib/flowise-variables-client.ts
export class FlowiseVariablesClient extends FlowiseBaseClient {
  async setVariable(key: string, value: any, options?: VariableOptions): Promise<Variable> {
    return this.request('POST', '/api/v1/variables/set', { key, value, ...options });
  }

  async getVariable(key: string): Promise<Variable> {
    return this.request('GET', `/api/v1/variables/${key}`);
  }

  async listVariables(scope?: string): Promise<Variable[]> {
    const params = scope ? `?scope=${scope}` : '';
    return this.request('GET', `/api/v1/variables${params}`);
  }
}
```

---

### 10. Vector Upsert API

**Propósito:** Gerenciar vetores para busca semântica

#### Endpoints
```typescript
// Inserir/atualizar vetores
POST /api/v1/vector/upsert

// Buscar vetores similares
POST /api/v1/vector/search

// Deletar vetores
DELETE /api/v1/vector/{id}

// Obter vetor específico
GET /api/v1/vector/{id}
```

#### Estrutura de Dados
```typescript
interface VectorUpsert {
  id: string;
  content: string;
  embedding: number[];
  metadata: VectorMetadata;
  namespace?: string;
}

interface VectorSearch {
  query: string;
  topK: number;
  namespace?: string;
  filter?: Record<string, any>;
}

interface VectorResult {
  id: string;
  content: string;
  score: number;
  metadata: VectorMetadata;
}
```

#### Casos de Uso no Zania
- Inserir vetores para busca
- Atualizar embeddings
- Busca semântica
- Otimizar recuperação de informação

#### Exemplo de Integração
```typescript
// src/lib/flowise-vector-client.ts
export class FlowiseVectorClient extends FlowiseBaseClient {
  async upsertVectors(vectors: VectorUpsert[]): Promise<UpsertResult> {
    return this.request('POST', '/api/v1/vector/upsert', { vectors });
  }

  async searchVectors(query: string, options: VectorSearch): Promise<VectorResult[]> {
    return this.request('POST', '/api/v1/vector/search', { query, ...options });
  }

  async deleteVector(id: string): Promise<void> {
    return this.request('DELETE', `/api/v1/vector/${id}`);
  }
}
```

---

## Exemplos de Implementação

### Cliente Base para APIs Flowise

```typescript
// src/lib/flowise-base-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

export class FlowiseBaseClient {
  protected client: AxiosInstance;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.flowiseai.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.getDefaultHeaders(),
      timeout: 30000
    });

    this.setupInterceptors();
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Zania-Platform/2.0.0'
    };
  }

  private setupInterceptors(): void {
    // Request interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[${new Date().toISOString()}] Flowise API Request:`, {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para retry e logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[${new Date().toISOString()}] Flowise API Response:`, {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config;
        
        if (!config || !config.retry) {
          config.retry = { count: 0, maxRetries: 3 };
        }
        
        // Implementar retry para falhas de rede ou erros 5xx
        if (config.retry.count < config.retry.maxRetries && 
            (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
          config.retry.count++;
          const delay = Math.pow(2, config.retry.count) * 1000; // Exponential backoff
          
          console.log(`Retry attempt ${config.retry.count} for ${config.method} ${config.url}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.client(config);
        }
        
        console.error(`[${new Date().toISOString()}] Flowise API Error:`, {
          status: error.response?.status,
          message: error.message,
          url: config.url
        });
        
        return Promise.reject(error);
      }
    );
  }

  async request(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Erro de resposta da API
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          return new Error('Não autorizado: Verifique sua API key');
        case 403:
          return new Error('Acesso negado: Permissões insuficientes');
        case 404:
          return new Error('Recurso não encontrado');
        case 429:
          return new Error('Limite de taxa excedido');
        case 500:
          return new Error('Erro interno do servidor Flowise');
        default:
          return new Error(`Erro ${status}: ${message}`);
      }
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de rede: Não foi possível conectar ao servidor Flowise');
    } else {
      // Outros erros
      return new Error(error.message || 'Erro desconhecido');
    }
  }
}
```

### Factory Pattern para Clientes

```typescript
// src/lib/flowise-client-factory.ts
import { 
  FlowiseAssistantsClient,
  FlowiseAttachmentsClient,
  FlowiseDocumentStoreClient,
  FlowiseLeadsClient,
  FlowisePingClient,
  FlowisePredictionClient,
  FlowiseToolsClient,
  FlowiseUpsertHistoryClient,
  FlowiseVariablesClient,
  FlowiseVectorClient
} from './clients';

export class FlowiseClientFactory {
  private static instance: FlowiseClientFactory;
  private clients: Map<string, any> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): FlowiseClientFactory {
    if (!FlowiseClientFactory.instance) {
      FlowiseClientFactory.instance = new FlowiseClientFactory();
    }
    return FlowiseClientFactory.instance;
  }

  getAssistantsClient(): FlowiseAssistantsClient {
    return this.getClient('assistants', FlowiseAssistantsClient);
  }

  getAttachmentsClient(): FlowiseAttachmentsClient {
    return this.getClient('attachments', FlowiseAttachmentsClient);
  }

  getDocumentStoreClient(): FlowiseDocumentStoreClient {
    return this.getClient('documentStore', FlowiseDocumentStoreClient);
  }

  getLeadsClient(): FlowiseLeadsClient {
    return this.getClient('leads', FlowiseLeadsClient);
  }

  getPingClient(): FlowisePingClient {
    return this.getClient('ping', FlowisePingClient);
  }

  getPredictionClient(): FlowisePredictionClient {
    return this.getClient('prediction', FlowisePredictionClient);
  }

  getToolsClient(): FlowiseToolsClient {
    return this.getClient('tools', FlowiseToolsClient);
  }

  getUpsertHistoryClient(): FlowiseUpsertHistoryClient {
    return this.getClient('upsertHistory', FlowiseUpsertHistoryClient);
  }

  getVariablesClient(): FlowiseVariablesClient {
    return this.getClient('variables', FlowiseVariablesClient);
  }

  getVectorClient(): FlowiseVectorClient {
    return this.getClient('vector', FlowiseVectorClient);
  }

  private getClient<T>(key: string, ClientClass: new (...args: any[]) => T): T {
    if (!this.clients.has(key)) {
      const apiKey = process.env.FLOWISE_API_KEY;
      const baseUrl = process.env.FLOWISE_BASE_URL;
      
      if (!apiKey) {
        throw new Error('FLOWISE_API_KEY não está configurada');
      }

      this.clients.set(key, new ClientClass(apiKey, baseUrl));
    }
    
    return this.clients.get(key);
  }

  // Limpar todos os clientes (útil para testes)
  clear(): void {
    this.clients.clear();
  }
}

// Exportar instância singleton
export const flowiseClientFactory = FlowiseClientFactory.getInstance();
```

---

## Clientes Específicos

### Cliente Unificado para Zania

```typescript
// src/lib/flowise-zania-client.ts
import { flowiseClientFactory } from './flowise-client-factory';

export interface ZaniaFlowiseConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export class ZaniaFlowiseClient {
  private config: ZaniaFlowiseConfig;

  constructor(config: ZaniaFlowiseConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    };
  }

  // Propriedades para acessar clientes específicos
  get assistants() {
    return flowiseClientFactory.getAssistantsClient();
  }

  get attachments() {
    return flowiseClientFactory.getAttachmentsClient();
  }

  get documents() {
    return flowiseClientFactory.getDocumentStoreClient();
  }

  get leads() {
    return flowiseClientFactory.getLeadsClient();
  }

  get ping() {
    return flowiseClientFactory.getPingClient();
  }

  get prediction() {
    return flowiseClientFactory.getPredictionClient();
  }

  get tools() {
    return flowiseClientFactory.getToolsClient();
  }

  get history() {
    return flowiseClientFactory.getUpsertHistoryClient();
  }

  get variables() {
    return flowiseClientFactory.getVariablesClient();
  }

  get vector() {
    return flowiseClientFactory.getVectorClient();
  }

  // Métodos de conveniência para operações comuns
  async healthCheck(): Promise<boolean> {
    try {
      return await this.ping.isHealthy();
    } catch {
      return false;
    }
  }

  async createAgentWithKnowledge(data: {
    name: string;
    description: string;
    knowledge: string;
    tools?: string[];
  }): Promise<any> {
    // Criar assistente
    const assistant = await this.assistants.createAssistant({
      name: data.name,
      description: data.description,
      type: 'knowledge',
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `Você é um assistente especializado com acesso a base de conhecimento.`
      }
    });

    // Adicionar documento à base de conhecimento
    if (data.knowledge) {
      await this.documents.upsertDocument({
        title: `Knowledge for ${data.name}`,
        content: data.knowledge,
        metadata: {
          source: 'zania',
          assistantId: assistant.id,
          type: 'knowledge_base'
        }
      });
    }

    return assistant;
  }

  async processMessageWithAttachments(data: {
    message: string;
    attachments?: File[];
    sessionId?: string;
  }): Promise<any> {
    const { message, attachments, sessionId } = data;

    // Processar anexos se existirem
    const processedAttachments = [];
    if (attachments) {
      for (const file of attachments) {
        const attachment = await this.attachments.uploadAttachment(file);
        processedAttachments.push(attachment);
      }
    }

    // Fazer previsão com o contexto
    const prediction = await this.prediction.predict({
      input: message,
      context: {
        attachments: processedAttachments,
        sessionId
      }
    });

    return {
      response: prediction.output,
      attachments: processedAttachments,
      metadata: prediction.metadata
    };
  }
}
```

---

## Padrões de Resposta

### Estrutura Padrão de Resposta

```typescript
interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

interface PaginatedResponse<T> extends StandardResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Tratamento de Erros Padrão

```typescript
// src/lib/flowise-error-handler.ts
export class FlowiseErrorHandler {
  static handle(error: any): StandardResponse {
    console.error('Flowise API Error:', error);

    if (error.response) {
      // Erros da API Flowise
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: data.message || 'Requisição inválida',
              details: data
            }
          };

        case 401:
          return {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Não autorizado: Verifique suas credenciais'
            }
          };

        case 403:
          return {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Acesso negado: Permissões insuficientes'
            }
          };

        case 404:
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Recurso não encontrado'
            }
          };

        case 429:
          return {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Limite de requisições excedido'
            }
          };

        case 500:
          return {
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Erro interno do servidor Flowise'
            }
          };

        default:
          return {
            success: false,
            error: {
              code: 'UNKNOWN_ERROR',
              message: `Erro ${status}: ${error.message}`
            }
          };
      }
    } else if (error.request) {
      // Erros de rede
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erro de conexão com o servidor Flowise'
        }
      };
    } else {
      // Outros erros
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Erro desconhecido'
        }
      };
    }
  }
}
```

---

## Tratamento de Erros

### Estratégia de Retry

```typescript
// src/lib/flowise-retry-strategy.ts
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

export class FlowiseRetryStrategy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND'],
      ...config
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    onError?: (error: any, attempt: number) => void
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (onError) {
          onError(error, attempt);
        }

        // Verificar se deve tentar novamente
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        // Calcular delay
        const delay = this.calculateDelay(attempt);
        
        console.log(`Retry attempt ${attempt}/${this.config.maxRetries} after ${delay}ms`);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: any, attempt: number): boolean {
    // Não tentar novamente se atingiu o máximo
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Tentar novamente para erros de rede específicos
    if (error.code && this.config.retryableErrors.includes(error.code)) {
      return true;
    }

    // Tentar novamente para erros 5xx
    if (error.response && error.response.status >= 500) {
      return true;
    }

    // Tentar novamente para rate limiting (429)
    if (error.response && error.response.status === 429) {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffFactor, attempt - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Circuit Breaker

```typescript
// src/lib/flowise-circuit-breaker.ts
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  expectedExceptionPredicate?: (error: any) => boolean;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class FlowiseCircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - blocking calls');
      } else {
        this.transitionToHalfOpen();
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(error: any): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.shouldTripCircuit(error)) {
      this.transitionToOpen();
    }
  }

  private shouldTripCircuit(error: any): boolean {
    if (this.config.expectedExceptionPredicate) {
      return this.config.expectedExceptionPredicate(error);
    }

    return this.failures >= this.config.failureThreshold;
  }

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    console.log(`Circuit breaker OPENED - will reset at ${new Date(this.nextAttemptTime).toISOString()}`);
  }

  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    console.log('Circuit breaker HALF_OPEN - allowing trial request');
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }
}
```

---

## Conclusão

Este guia completo serve como referência permanente para o projeto Zania, cobrindo todos os aspectos da integração com as APIs Flowise. Com ele, você não precisará consultar links externos constantemente, pois todas as informações necessárias estão documentadas aqui.

### Próximos Passos

1. **Implementar os clientes específicos** para cada API
2. **Configurar variáveis de ambiente** no projeto
3. **Implementar testes** para cada cliente
4. **Adicionar monitoramento** e logging
5. **Documentar casos de uso específicos** do Zania

### Referências Rápidas

- **Factory Pattern:** `flowiseClientFactory`
- **Cliente Unificado:** `ZaniaFlowiseClient`
- **Tratamento de Erros:** `FlowiseErrorHandler`
- **Retry Strategy:** `FlowiseRetryStrategy`
- **Circuit Breaker:** `FlowiseCircuitBreaker`

---

*Este guia foi criado para o projeto Zania e deve ser mantido atualizado conforme as APIs Flowise evoluam. Última atualização: 20/08/2025*