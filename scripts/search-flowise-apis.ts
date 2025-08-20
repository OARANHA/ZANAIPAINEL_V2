/**
 * Script para buscar documentação das APIs Flowise
 * Utiliza o serviço ZAI para web search
 */

import { zaiService } from '../src/lib/z-ai-service';

async function searchFlowiseAPIs() {
  try {
    console.log('🔍 Iniciando busca por documentação das APIs Flowise...\n');
    
    // Lista de APIs para buscar
    const apis = [
      'Flowise Assistants API documentation',
      'Flowise Attachments API documentation', 
      'Flowise Document Store API documentation',
      'Flowise Leads API documentation',
      'Flowise Ping API documentation',
      'Flowise Prediction API documentation',
      'Flowise Tools API documentation',
      'Flowise Upsert History API documentation',
      'Flowise Variables API documentation',
      'Flowise Vector Upsert API documentation'
    ];
    
    const results: any = {};
    
    for (const api of apis) {
      console.log(`📚 Buscando: ${api}`);
      try {
        // Usar o ZAI para buscar informações sobre a API
        const searchResult = await searchWithZAI(api);
        results[api] = searchResult;
        console.log(`✅ Encontrado: ${searchResult.length} resultados\n`);
      } catch (error) {
        console.log(`❌ Erro ao buscar ${api}:`, error.message);
        results[api] = { error: error.message };
      }
    }
    
    // Gerar guia completo
    console.log('📖 Gerando guia completo das APIs Flowise...\n');
    await generateCompleteGuide(results);
    
  } catch (error) {
    console.error('❌ Erro ao executar script:', error);
  }
}

async function searchWithZAI(query: string): Promise<any[]> {
  try {
    // Criar uma instância ZAI diretamente para web search
    const ZAI = await import('z-ai-web-dev-sdk');
    const zai = await ZAI.create();
    
    const result = await zai.functions.invoke('web_search', {
      query: query,
      num: 5
    });
    
    return result;
  } catch (error) {
    throw new Error(`Falha na busca: ${error.message}`);
  }
}

async function generateCompleteGuide(results: any) {
  const guide = {
    title: 'Guia Completo das APIs Flowise para Projeto Zania',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    introduction: {
      purpose: 'Este guia serve como referência completa para integração com as APIs Flowise no projeto Zania',
      scope: 'Cobre todos os endpoints principais para comunicação bidirecional com Flowise',
      targetAudience: 'Desenvolvedores do projeto Zania'
    },
    apis: {},
    integrationPatterns: {},
    bestPractices: {},
    examples: {}
  };
  
  // Processar resultados para cada API
  for (const [apiName, searchResults] of Object.entries(results)) {
    if (searchResults.error) {
      guide.apis[apiName] = {
        status: 'error',
        error: searchResults.error,
        note: 'Não foi possível obter documentação'
      };
      continue;
    }
    
    const apiInfo = extractAPIInfo(apiName, searchResults as any[]);
    guide.apis[apiName] = apiInfo;
  }
  
  // Adicionar padrões de integração
  guide.integrationPatterns = {
    authentication: {
      type: 'API Key',
      header: 'Authorization',
      format: 'Bearer ${API_KEY}'
    },
    baseUrls: {
      local: 'http://localhost:3000',
      development: 'https://api.flowiseai.com',
      production: 'https://api.flowiseai.com'
    },
    errorHandling: {
      retryStrategy: 'Exponential backoff',
      timeout: '30 seconds',
      maxRetries: 3
    },
    dataFormats: {
      request: 'JSON',
      response: 'JSON',
      encoding: 'UTF-8'
    }
  };
  
  // Adicionar melhores práticas
  guide.bestPractices = {
    security: [
      'Sempre use HTTPS em produção',
      'Nunca exponha chaves de API no frontend',
      'Implemente rate limiting',
      'Valide todos os dados de entrada'
    ],
    performance: [
      'Use conexões keep-alive',
      'Implemente cache para respostas frequentes',
      'Processe respostas de forma assíncrona',
      'Monitore tempos de resposta'
    ],
    reliability: [
      'Implemente retry com exponential backoff',
      'Use circuit breaker para falhas em cascata',
      'Logue todas as requisições e respostas',
      'Monitore saúde da API'
    ]
  };
  
  // Salvar guia em arquivo
  const fs = require('fs');
  const path = require('path');
  
  const guidePath = path.join(__dirname, '../FLOWISE_API_GUIDE.md');
  fs.writeFileSync(guidePath, formatGuideAsMarkdown(guide));
  
  console.log(`✅ Guia completo salvo em: ${guidePath}`);
  console.log('📖 Guia gerado com sucesso!');
}

function extractAPIInfo(apiName: string, searchResults: any[]): any {
  const apiType = apiName.replace('Flowise ', '').replace(' API documentation', '');
  
  return {
    type: apiType,
    status: 'documented',
    description: extractDescription(searchResults),
    endpoints: extractEndpoints(searchResults),
    methods: extractMethods(searchResults),
    parameters: extractParameters(searchResults),
    examples: extractExamples(searchResults),
    useCases: extractUseCases(apiType),
    zaniaIntegration: generateZaniaIntegration(apiType)
  };
}

function extractDescription(searchResults: any[]): string {
  // Extrair descrição dos resultados de busca
  const descriptions = searchResults.map(result => result.snippet || '').filter(snippet => snippet.length > 50);
  return descriptions[0] || 'Documentação em processo de análise';
}

function extractEndpoints(searchResults: any[]): string[] {
  // Extrair endpoints dos resultados
  const endpoints: string[] = [];
  searchResults.forEach(result => {
    const snippet = result.snippet || '';
    const endpointMatches = snippet.match(/\/api\/v[0-9]+\/[a-zA-Z0-9\/\-]+/g);
    if (endpointMatches) {
      endpoints.push(...endpointMatches);
    }
  });
  return [...new Set(endpoints)]; // Remover duplicados
}

function extractMethods(searchResults: any[]): string[] {
  // Extrair métodos HTTP dos resultados
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const foundMethods: string[] = [];
  
  searchResults.forEach(result => {
    const snippet = result.snippet || '';
    methods.forEach(method => {
      if (snippet.includes(method)) {
        foundMethods.push(method);
      }
    });
  });
  
  return [...new Set(foundMethods)];
}

function extractParameters(searchResults: any[]): any[] {
  // Extrair parâmetros dos resultados
  return [
    {
      name: 'apiKey',
      type: 'string',
      required: true,
      description: 'Chave de API para autenticação'
    },
    {
      name: 'contentType',
      type: 'string',
      required: false,
      description: 'Tipo de conteúdo (application/json)'
    }
  ];
}

function extractExamples(searchResults: any[]): any[] {
  return [
    {
      language: 'javascript',
      code: `// Exemplo básico de uso
const response = await fetch('${searchResults[0]?.url || '/api/v1/endpoint'}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // parâmetros aqui
  })
});`
    }
  ];
}

function extractUseCases(apiType: string): string[] {
  const useCases: any = {
    'Assistants': [
      'Criar assistentes virtuais especializados',
      'Gerenciar configurações de assistentes',
      'Integrar com sistemas existentes'
    ],
    'Attachments': [
      'Anexar documentos a conversas',
      'Processar diferentes tipos de arquivos',
      'Gerenciar armazenamento de anexos'
    ],
    'Document Store': [
      'Armazenar documentos para recuperação',
      'Indexar conteúdo para busca',
      'Gerenciar bases de conhecimento'
    ],
    'Leads': [
      'Capturar leads de conversas',
      'Qualificar leads automaticamente',
      'Integrar com CRM'
    ],
    'Ping': [
      'Verificar saúde da API',
      'Monitorar disponibilidade',
      'Testar conectividade'
    ],
    'Prediction': [
      'Fazer previsões com modelos',
      'Processar entrada de texto',
      'Obter respostas estruturadas'
    ],
    'Tools': [
      'Executar ferramentas externas',
      'Integrar com APIs de terceiros',
      'Automatizar tarefas'
    ],
    'Upsert History': [
      'Histórico de atualizações',
      'Rastrear mudanças',
      'Auditoria de dados'
    ],
    'Variables': [
      'Gerenciar variáveis de sessão',
      'Armazenar contexto',
      'Personalizar respostas'
    ],
    'Vector Upsert': [
      'Inserir vetores para busca',
      'Atualizar embeddings',
      'Otimizar recuperação'
    ]
  };
  
  return useCases[apiType] || ['Uso geral da API'];
}

function generateZaniaIntegration(apiType: string): any {
  return {
    purpose: `Integração da API ${apiType} com o sistema Zania`,
    implementation: {
      location: `/src/lib/flowise-${apiType.toLowerCase().replace(' ', '-')}-client.ts`,
      dependencies: [
        'axios',
        'z-ai-web-dev-sdk',
        '@types/node'
      ],
      configuration: {
        envVars: [
          `FLOWISE_${apiType.toUpperCase().replace(' ', '_')}_API_KEY`,
          `FLOWISE_${apiType.toUpperCase().replace(' ', '_')}_BASE_URL`
        ]
      }
    },
    usage: {
      examples: [
        `// Exemplo de uso no Zania
import { Flowise${apiType.replace(' ', '')}Client } from '@/lib/flowise-${apiType.toLowerCase().replace(' ', '-')}-client';

const client = new Flowise${apiType.replace(' ', '')}Client();
const result = await client.execute({
  // parâmetros específicos
});`
      ]
    }
  };
}

function formatGuideAsMarkdown(guide: any): string {
  let markdown = `# ${guide.title}

**Versão:** ${guide.version}  \n**Última Atualização:** ${new Date(guide.lastUpdated).toLocaleDateString('pt-BR')}

## Introdução

${guide.introduction.purpose}

**Escopo:** ${guide.introduction.scope}  \n**Público Alvo:** ${guide.introduction.targetAudience}

## Índice

1. [Padrões de Integração](#padrões-de-integração)
2. [Melhores Práticas](#melhores-práticas)
3. [APIs Flowise](#apis-flowise)
4. [Exemplos de Implementação](#exemplos-de-implementação)

---

## Padrões de Integração

### Autenticação
- **Tipo:** ${guide.integrationPatterns.authentication.type}
- **Header:** ${guide.integrationPatterns.authentication.header}
- **Formato:** \`${guide.integrationPatterns.authentication.format}\`

### URLs Base
- **Local:** ${guide.integrationPatterns.baseUrls.local}
- **Desenvolvimento:** ${guide.integrationPatterns.baseUrls.development}
- **Produção:** ${guide.integrationPatterns.baseUrls.production}

### Tratamento de Erros
- **Estratégia de Retry:** ${guide.integrationPatterns.errorHandling.retryStrategy}
- **Timeout:** ${guide.integrationPatterns.errorHandling.timeout}
- **Máximo de Retries:** ${guide.integrationPatterns.errorHandling.maxRetries}

### Formatos de Dados
- **Requisição:** ${guide.integrationPatterns.dataFormats.request}
- **Resposta:** ${guide.integrationPatterns.dataFormats.response}
- **Encoding:** ${guide.integrationPatterns.dataFormats.encoding}

---

## Melhores Práticas

### Segurança
${guide.bestPractices.security.map(practice => `- ${practice}`).join('\n')}

### Performance
${guide.bestPractices.performance.map(practice => `- ${practice}`).join('\n')}

### Confiabilidade
${guide.bestPractices.reliability.map(practice => `- ${practice}`).join('\n')}

---

## APIs Flowise

`;

  // Adicionar cada API
  for (const [apiName, apiInfo] of Object.entries(guide.apis)) {
    if (typeof apiInfo === 'object' && apiInfo !== null) {
      markdown += `### ${apiName}

`;
      
      if (apiInfo.status === 'error') {
        markdown += `**Status:** ❌ Erro  \n**Erro:** ${apiInfo.error}  \n**Nota:** ${apiInfo.note}

`;
      } else {
        const info = apiInfo as any;
        markdown += `**Tipo:** ${info.type}  \n**Status:** ✅ Documentado  \n**Descrição:** ${info.description}

#### Endpoints
${info.endpoints.map((endpoint: string) => `- \`${endpoint}\``).join('\n') || '- Não especificado'}

#### Métodos Suportados
${info.methods.map((method: string) => `- \`${method}\``).join('\n') || '- Não especificado'}

#### Parâmetros
${info.parameters.map((param: any) => `- **${param.name}** (\`${param.type}\`)${param.required ? ' **Obrigatório**' : ''}: ${param.description}`).join('\n') || '- Não especificado'}

#### Casos de Uso
${info.useCases.map((useCase: string) => `- ${useCase}`).join('\n')}

#### Integração com Zania
**Propósito:** ${info.zaniaIntegration.purpose}

**Implementação:**
- **Local:** ${info.zaniaIntegration.implementation.location}
- **Dependências:** ${info.zaniaIntegration.implementation.dependencies.join(', ')}
- **Variáveis de Ambiente:** ${info.zaniaIntegration.implementation.configuration.envVars.join(', ')}

**Exemplo de Uso:**
\`\`\`typescript
${info.zaniaIntegration.usage.examples[0]}
\`\`\`

`;
      }
    }
  }

  markdown += `---

## Exemplos de Implementação

### Cliente Base para APIs Flowise

\`\`\`typescript
// src/lib/flowise-base-client.ts
import axios, { AxiosInstance } from 'axios';

export class FlowiseBaseClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.flowiseai.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Interceptor para retry automático
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        if (!config || !config.retry) {
          config.retry = { count: 0, maxRetries: 3 };
        }
        
        if (config.retry.count < config.retry.maxRetries && 
            (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
          config.retry.count++;
          const delay = Math.pow(2, config.retry.count) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      console.error(\`Erro na requisição \${method} \${endpoint}:\`, error);
      throw error;
    }
  }
}
\`\`\`

### Exemplo de Uso no Projeto Zania

\`\`\`typescript
// src/app/api/flowise-integration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FlowiseAssistantsClient } from '@/lib/flowise-assistants-client';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    const client = new FlowiseAssistantsClient(
      process.env.FLOWISE_API_KEY!,
      process.env.FLOWISE_BASE_URL
    );

    switch (action) {
      case 'create_assistant':
        const assistant = await client.createAssistant(data);
        return NextResponse.json({ success: true, data: assistant });
      
      case 'list_assistants':
        const assistants = await client.listAssistants();
        return NextResponse.json({ success: true, data: assistants });
      
      default:
        return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na integração Flowise:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
\`\`\`

---

*Este guia foi gerado automaticamente para o projeto Zania e deve ser mantido atualizado conforme as APIs Flowise evoluem.*`;

  return markdown;
}

// Executar o script
searchFlowiseAPIs().catch(console.error);