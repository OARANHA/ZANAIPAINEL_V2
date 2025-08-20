// Exemplos completos de uso das APIs Flowise para Projeto Zania
// Baseado no guia: FLOWISE_API_COMPLETE_GUIDE.md

import { FlowiseConfigManager } from '@/lib/flowise-config';

// Cliente completo para todas as APIs Flowise
export class FlowiseCompleteUsage {
  private config: FlowiseConfigManager;

  constructor(config?: any) {
    this.config = new FlowiseConfigManager(config);
  }

  // ============================================
  // 1. EXEMPLOS COMPLETOS DE USO DAS APIS
  // ============================================

  /**
   * Exemplo 1: Criar Assistente com Base de Conhecimento
   * Demonstra uso combinado de Assistants API + Document Store API
   */
  async exemplo1_CriarAssistenteComConhecimento() {
    console.log('=== Exemplo 1: Criar Assistente com Base de Conhecimento ===');

    try {
      // 1. Criar assistente especializado
      const assistant = await this.createAssistant({
        name: 'Assistente de Integração Flowise',
        description: 'Assistente especializado em integração com APIs Flowise',
        type: 'knowledge',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'Você é um especialista em integração de sistemas com Flowise.',
          tools: ['calculator', 'web_search']
        }
      });

      console.log('✅ Assistente criado:', assistant.id);

      // 2. Adicionar documentos à base de conhecimento
      const documentos = [
        {
          title: 'Guia de Integração Flowise',
          content: `Flowise é uma plataforma para criar e gerenciar workflows de IA.
          A integração com Zania permite criar agentes especializados.`,
          metadata: {
            assistantId: assistant.id,
            category: 'integration',
            tags: ['flowise', 'integration', 'api']
          }
        },
        {
          title: 'API de Assistentes',
          content: `A API de Assistentes permite criar, gerenciar e executar assistentes virtuais.
          Endpoints principais: GET /api/v1/assistants, POST /api/v1/assistants`,
          metadata: {
            assistantId: assistant.id,
            category: 'api',
            tags: ['assistants', 'api', 'endpoints']
          }
        }
      ];

      for (const doc of documentos) {
        await this.upsertDocument(doc);
        console.log('📄 Documento adicionado:', doc.title);
      }

      // 3. Testar o assistente
      const resultado = await this.executeAssistant(assistant.id, {
        input: 'Como faço para integrar o Zania com Flowise?',
        context: { userId: 'user-123', session: 'demo-session' }
      });

      console.log('💭 Resposta do assistente:', resultado.output);

      return {
        success: true,
        assistant,
        documentosAdicionados: documentos.length,
        respostaTeste: resultado.output
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 1:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 2: Processar Mensagem com Anexos
   * Demonstra uso combinado de Attachments API + Prediction API
   */
  async exemplo2_ProcessarMensagemComAnexos() {
    console.log('=== Exemplo 2: Processar Mensagem com Anexos ===');

    try {
      // 1. Simular upload de anexos
      const anexosSimulados = [
        new File(['Conteúdo do manual técnico'], 'manual.pdf', { type: 'application/pdf' }),
        new File(['Dados da planilha'], 'dados.csv', { type: 'text/csv' })
      ];

      const attachmentsProcessados = [];

      // 2. Upload e processamento de cada anexo
      for (const file of anexosSimulados) {
        // Upload do anexo
        const attachment = await this.uploadAttachment(file, {
          category: 'document',
          userId: 'user-123'
        });
        console.log('📎 Anexo uploadado:', attachment.filename);

        // Processar anexo para extração de conteúdo
        const processed = await this.processAttachment(attachment.id, {
          extractText: true,
          detectLanguage: true,
          extractEntities: true
        });
        console.log('🔍 Anexo processado:', processed.metadata?.extractedText?.substring(0, 100));

        attachmentsProcessados.push({
          attachment,
          processed
        });
      }

      // 3. Fazer previsão considerando os anexos
      const prediction = await this.predict({
        input: 'Analise os documentos anexados e me dê um resumo das principais informações',
        context: {
          userId: 'user-123',
          attachments: attachmentsProcessados.map(a => ({
            filename: a.attachment.filename,
            content: a.processed.metadata?.extractedText,
            type: a.attachment.mimeType
          }))
        },
        parameters: {
          temperature: 0.5,
          maxTokens: 1000
        }
      });

      console.log('🤖 Análise gerada:', prediction.output);

      return {
        success: true,
        anexosProcessados: attachmentsProcessados.length,
        analiseGerada: prediction.output,
        tokensUsados: prediction.tokensUsed
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 2:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 3: Gerenciar Leads e Conversões
   * Demonstra uso completo da Leads API
   */
  async exemplo3_GerenciarLeadsEConversoes() {
    console.log('=== Exemplo 3: Gerenciar Leads e Conversões ===');

    try {
      // 1. Criar novos leads a partir de interações
      const leadsData = [
        {
          name: 'Maria Santos',
          email: 'maria@techcorp.com',
          company: 'TechCorp Solutions',
          phone: '+55 11 99999-8888',
          metadata: {
            conversationId: 'conv-456',
            interests: ['automação', 'ia', 'integração'],
            budget: '20k-50k',
            timeline: '2-4 meses',
            notes: 'Interessada em integração Flowise para automação de processos'
          }
        },
        {
          name: 'João Oliveira',
          email: 'joao@startupx.com',
          company: 'StartupX',
          metadata: {
            conversationId: 'conv-789',
            interests: ['chatbots', 'assistentes virtuais'],
            budget: '5k-15k',
            timeline: '1-2 meses',
            notes: 'Busca solução de atendimento ao cliente com IA'
          }
        }
      ];

      const leadsCriados = [];

      for (const leadData of leadsData) {
        const lead = await this.createLead(leadData);
        leadsCriados.push(lead);
        console.log('🎯 Lead criado:', lead.name, '-', lead.email);
      }

      // 2. Qualificar leads automaticamente
      const leadsQualificados = [];

      for (const lead of leadsCriados) {
        const qualificado = await this.qualifyLead(lead.id, {
          criteria: {
            budgetMatch: lead.metadata.budget !== 'menos de 5k',
            timelineMatch: lead.metadata.timeline !== 'mais de 6 meses',
            interestLevel: lead.metadata.interests.length >= 2 ? 'high' : 'medium'
          }
        });

        leadsQualificados.push(qualificado);
        console.log('📊 Lead qualificado:', qualificado.name, '- Score:', qualificado.score);
      }

      // 3. Converter lead mais qualificado
      const leadTop = leadsQualificados.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      const convertido = await this.convertLead(leadTop.id, {
        customerData: {
          plan: 'enterprise',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          assignedTeam: 'integration-team'
        }
      });

      console.log('🎉 Lead convertido em cliente:', convertido.name);

      return {
        success: true,
        leadsCriados: leadsCriados.length,
        leadsQualificados: leadsQualificados.length,
        leadConvertido: convertido.name
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 3:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 4: Busca Semântica com Embeddings
   * Demonstra uso da Vector Upsert API + Document Store API
   */
  async exemplo4_BuscaSemanticaComEmbeddings() {
    console.log('=== Exemplo 4: Busca Semântica com Embeddings ===');

    try {
      // 1. Preparar documentos para indexação vetorial
      const documentosParaIndexar = [
        'Flowise permite criar workflows de IA visualmente',
        'A API de assistentes é ideal para criar agentes especializados',
        'Document Store API gerencia armazenamento e recuperação de documentos',
        'Vector Upsert API permite busca semântica avançada',
        'Tools API possibilita integração com sistemas externos',
        'Leads API ajuda na gestão de oportunidades de negócio'
      ];

      const metadata = [
        { category: 'workflows', source: 'docs' },
        { category: 'assistants', source: 'docs' },
        { category: 'documents', source: 'docs' },
        { category: 'vector', source: 'docs' },
        { category: 'tools', source: 'docs' },
        { category: 'business', source: 'docs' }
      ];

      // 2. Indexar documentos usando Vector Upsert
      const upsertResult = await this.upsertVectors({
        texts: documentosParaIndexar,
        metadata: metadata,
        chunkSize: 1000,
        chunkOverlap: 200
      });

      console.log('📚 Documentos indexados:', upsertResult.count || documentosParaIndexar.length);

      // 3. Realizar buscas semânticas
      const buscas = [
        'como criar agentes especializados',
        'gestão de documentos e conhecimento',
        'integração com sistemas externos',
        'oportunidades de negócio'
      ];

      const resultadosBusca = [];

      for (const query of buscas) {
        const resultados = await this.searchVectors({
          query: query,
          limit: 3,
          threshold: 0.5,
          filters: { source: 'docs' }
        });

        console.log(`🔍 Busca por "${query}":`);
        resultados.forEach((result, index) => {
          console.log(`  ${index + 1}. [Score: ${result.score.toFixed(3)}] ${result.text.substring(0, 100)}...`);
        });

        resultadosBusca.push({ query, resultados });
      }

      return {
        success: true,
        documentosIndexados: documentosParaIndexar.length,
        buscasRealizadas: buscas.length,
        resultadosBusca
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 4:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 5: Gerenciamento de Ferramentas e Execução
   * Demonstra uso completo da Tools API
   */
  async exemplo5_GerenciamentoFerramentas() {
    console.log('=== Exemplo 5: Gerenciamento de Ferramentas ===');

    try {
      // 1. Listar ferramentas disponíveis
      const ferramentasDisponiveis = await this.listTools();
      console.log('🛠️ Ferramentas disponíveis:', ferramentasDisponiveis.map(f => f.name));

      // 2. Registrar ferramentas personalizadas para Zania
      const ferramentasZania = [
        {
          name: 'zania-health-check',
          description: 'Verifica saúde dos serviços Zania',
          parameters: [
            { name: 'service', type: 'string', required: true, description: 'Nome do serviço' },
            { name: 'timeout', type: 'number', required: false, description: 'Timeout em ms' }
          ],
          returnType: 'HealthStatus',
          category: 'custom'
        },
        {
          name: 'zania-integration-status',
          description: 'Verifica status de integração com sistemas externos',
          parameters: [
            { name: 'system', type: 'string', required: true, description: 'Sistema a verificar' },
            { name: 'checkType', type: 'string', required: false, description: 'Tipo de verificação' }
          ],
          returnType: 'IntegrationStatus',
          category: 'custom'
        }
      ];

      const ferramentasRegistradas = [];

      for (const ferramenta of ferramentasZania) {
        try {
          const registrada = await this.registerTool(ferramenta);
          ferramentasRegistradas.push(registrada);
          console.log('✅ Ferramenta registrada:', registrada.name);
        } catch (error) {
          console.log('⚠️ Ferramenta já existe ou erro:', ferramenta.name, error.message);
        }
      }

      // 3. Executar ferramentas disponíveis
      const execucoes = [];

      // Executar calculadora
      try {
        const calcResult = await this.executeTool('calculator', {
          expression: '2 + 2 * 3'
        });
        execucoes.push({ tool: 'calculator', result: calcResult });
        console.log('🧮 Calculadora:', calcResult.result);
      } catch (error) {
        console.log('❌ Erro na calculadora:', error.message);
      }

      // Executar web search (se disponível)
      try {
        const searchResult = await this.executeTool('web_search', {
          query: 'Flowise API documentation',
          limit: 3
        });
        execucoes.push({ tool: 'web_search', result: searchResult });
        console.log('🌐 Web Search:', searchResult.results?.length || 0, 'resultados');
      } catch (error) {
        console.log('❌ Erro no web search:', error.message);
      }

      return {
        success: true,
        ferramentasDisponiveis: ferramentasDisponiveis.length,
        ferramentasRegistradas: ferramentasRegistradas.length,
        execucoesRealizadas: execucoes.length
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 5:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 6: Gerenciamento de Variáveis e Configuração
   * Demonstra uso da Variables API
   */
  async exemplo6_GerenciamentoVariaveis() {
    console.log('=== Exemplo 6: Gerenciamento de Variáveis ===');

    try {
      // 1. Definir variáveis de configuração para Zania
      const variaveisConfig = [
        {
          key: 'zania_api_timeout',
          value: '30000',
          type: 'number',
          category: 'api',
          description: 'Timeout para chamadas de API em milissegundos',
          isSecret: false
        },
        {
          key: 'zania_flowise_api_key',
          value: 'sk-flowise-key-123',
          type: 'string',
          category: 'credentials',
          description: 'API key para integração Flowise',
          isSecret: true
        },
        {
          key: 'zania_max_retries',
          value: '3',
          type: 'number',
          category: 'api',
          description: 'Número máximo de tentativas para requisições',
          isSecret: false
        },
        {
          key: 'zania_enable_logging',
          value: 'true',
          type: 'boolean',
          category: 'logging',
          description: 'Habilitar logging detalhado',
          isSecret: false
        }
      ];

      const variaveisCriadas = [];

      for (const variavel of variaveisConfig) {
        try {
          await this.setVariable(variavel.key, variavel.value, {
            type: variavel.type,
            category: variavel.category,
            description: variavel.description,
            isSecret: variavel.isSecret
          });
          variaveisCriadas.push(variavel.key);
          console.log('✅ Variável criada:', variavel.key);
        } catch (error) {
          console.log('⚠️ Variável já existe ou erro:', variavel.key, error.message);
        }
      }

      // 2. Obter variáveis por categoria
      const categorias = ['api', 'credentials', 'logging'];
      const variaveisPorCategoria = {};

      for (const categoria of categorias) {
        const vars = await this.getVariablesByCategory(categoria);
        variaveisPorCategoria[categoria] = vars;
        console.log(`📂 Variáveis da categoria "${categoria}":`, vars.length);
      }

      // 3. Usar variáveis de configuração
      const timeout = await this.getVariable('zania_api_timeout');
      const maxRetries = await this.getVariable('zania_max_retries');
      const enableLogging = await this.getVariable('zania_enable_logging');

      console.log('⚙️ Configuração carregada:');
      console.log('   Timeout:', timeout?.value, 'ms');
      console.log('   Max Retries:', maxRetries?.value);
      console.log('   Logging:', enableLogging?.value);

      return {
        success: true,
        variaveisCriadas: variaveisCriadas.length,
        categoriasConfiguradas: Object.keys(variaveisPorCategoria).length,
        configuracaoAplicada: {
          timeout: timeout?.value,
          maxRetries: maxRetries?.value,
          enableLogging: enableLogging?.value
        }
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 6:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Exemplo 7: Health Check e Monitoramento
   * Demonstra uso da Ping API + monitoramento contínuo
   */
  async exemplo7_HealthCheckEMonitoramento() {
    console.log('=== Exemplo 7: Health Check e Monitoramento ===');

    try {
      // 1. Health check básico
      console.log('🔍 Realizando health check básico...');
      const ping = await this.ping();
      console.log('✅ Status:', ping.status);
      console.log('📅 Timestamp:', ping.timestamp);
      console.log('⏱️ Uptime:', ping.uptime, 'ms');

      // 2. Health check detalhado
      console.log('\n🔍 Realizando health check detalhado...');
      const health = await this.health();
      console.log('📊 Status geral:', health.status);
      console.log('🖥️  Status dos serviços:', health.services);
      console.log('💾 Memória em uso:', health.metrics.memoryUsage, '%');
      console.log('⚡ CPU em uso:', health.metrics.cpuUsage, '%');

      // 3. Monitoramento contínuo (simulado)
      console.log('\n📈 Iniciando monitoramento contínuo (5 verificações)...');
      
      const monitoramentoResultados = [];
      const intervalo = 2000; // 2 segundos
      
      for (let i = 0; i < 5; i++) {
        const inicio = Date.now();
        
        try {
          const healthCheck = await this.health();
          const tempoResposta = Date.now() - inicio;
          
          const resultado = {
            tentativa: i + 1,
            status: healthCheck.status,
            tempoResposta: tempoResposta,
            servicos: healthCheck.services,
            memoria: healthCheck.metrics.memoryUsage,
            cpu: healthCheck.metrics.cpuUsage
          };
          
          monitoramentoResultados.push(resultado);
          
          console.log(`   Check ${i + 1}: ${healthCheck.status} (${tempoResposta}ms)`);
          
          // Aguardar próximo check
          if (i < 4) {
            await new Promise(resolve => setTimeout(resolve, intervalo));
          }
          
        } catch (error) {
          console.log(`   Check ${i + 1}: ERRO - ${error.message}`);
          monitoramentoResultados.push({
            tentativa: i + 1,
            status: 'error',
            erro: error.message
          });
        }
      }

      // 4. Análise dos resultados
      const checksBemSucedidos = monitoramentoResultados.filter(r => r.status !== 'error').length;
      const tempoMedioResposta = monitoramentoResultados
        .filter(r => r.tempoResposta)
        .reduce((sum, r) => sum + r.tempoResposta, 0) / checksBemSucedidos;

      console.log('\n📊 Análise do monitoramento:');
      console.log(`   Checks bem-sucedidos: ${checksBemSucedidos}/5`);
      console.log(`   Tempo médio de resposta: ${tempoMedioResposta.toFixed(2)}ms`);

      return {
        success: true,
        healthBasico: ping,
        healthDetalhado: health,
        monitoramento: {
          totalChecks: 5,
          checksSucesso: checksBemSucedidos,
          tempoMedioResposta: tempoMedioResposta,
          resultados: monitoramentoResultados
        }
      };

    } catch (error) {
      console.error('❌ Erro no exemplo 7:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES PARA CADA API
  // ============================================

  // Assistants API
  private async createAssistant(data: any) {
    const response = await fetch(this.config.buildUrl('assistants'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  private async executeAssistant(id: string, data: any) {
    const response = await fetch(this.config.buildUrl('assistants', `${id}/execute`), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Document Store API
  private async upsertDocument(data: any) {
    const response = await fetch(this.config.buildUrl('documentStore', 'upsert'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Attachments API
  private async uploadAttachment(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(this.config.buildUrl('attachments', 'upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.getApiKey()}`
      },
      body: formData
    });
    return response.json();
  }

  private async processAttachment(id: string, options: any) {
    const response = await fetch(this.config.buildUrl('attachments', `${id}/process`), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(options)
    });
    return response.json();
  }

  // Prediction API
  private async predict(data: any) {
    const response = await fetch(this.config.buildUrl('prediction'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Leads API
  private async createLead(data: any) {
    const response = await fetch(this.config.buildUrl('leads'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  private async qualifyLead(id: string, criteria: any) {
    const response = await fetch(this.config.buildUrl('leads', `${id}/qualify`), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(criteria)
    });
    return response.json();
  }

  private async convertLead(id: string, conversionData: any) {
    const response = await fetch(this.config.buildUrl('leads', `${id}/convert`), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(conversionData)
    });
    return response.json();
  }

  // Vector Upsert API
  private async upsertVectors(data: any) {
    const response = await fetch(this.config.buildUrl('vectorUpsert'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  private async searchVectors(data: any) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    });

    const response = await fetch(
      this.config.buildUrl('vectorUpsert', `search?${params.toString()}`),
      {
        method: 'GET',
        headers: this.config.getHeaders()
      }
    );
    return response.json();
  }

  // Tools API
  private async listTools() {
    const response = await fetch(this.config.buildUrl('tools'), {
      method: 'GET',
      headers: this.config.getHeaders()
    });
    return response.json();
  }

  private async registerTool(tool: any) {
    const response = await fetch(this.config.buildUrl('tools', 'register'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify(tool)
    });
    return response.json();
  }

  private async executeTool(toolName: string, parameters: any) {
    const response = await fetch(this.config.buildUrl('tools', `${toolName}/execute`), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify({ parameters })
    });
    return response.json();
  }

  // Variables API
  private async setVariable(key: string, value: string, options: any) {
    const response = await fetch(this.config.buildUrl('variables'), {
      method: 'POST',
      headers: this.config.getHeaders(),
      body: JSON.stringify({
        key,
        value,
        ...options
      })
    });
    return response.json();
  }

  private async getVariable(key: string) {
    const response = await fetch(this.config.buildUrl('variables', key), {
      method: 'GET',
      headers: this.config.getHeaders()
    });
    return response.json();
  }

  private async getVariablesByCategory(category: string) {
    const response = await fetch(this.config.buildUrl('variables', `category/${category}`), {
      method: 'GET',
      headers: this.config.getHeaders()
    });
    return response.json();
  }

  // Ping API
  private async ping() {
    const response = await fetch(this.config.buildUrl('ping'), {
      method: 'GET',
      headers: this.config.getHeaders()
    });
    return response.json();
  }

  private async health() {
    const response = await fetch(this.config.buildUrl('ping', 'health'), {
      method: 'GET',
      headers: this.config.getHeaders()
    });
    return response.json();
  }
}

// Função para executar todos os exemplos
export async function executarTodosExemplos() {
  const client = new FlowiseCompleteUsage();

  console.log('🚀 Iniciando execução de todos os exemplos Flowise...\n');

  const resultados = [];

  // Executar cada exemplo
  const exemplos = [
    () => client.exemplo1_CriarAssistenteComConhecimento(),
    () => client.exemplo2_ProcessarMensagemComAnexos(),
    () => client.exemplo3_GerenciarLeadsEConversoes(),
    () => client.exemplo4_BuscaSemanticaComEmbeddings(),
    () => client.exemplo5_GerenciamentoFerramentas(),
    () => client.exemplo6_GerenciamentoVariaveis(),
    () => client.exemplo7_HealthCheckEMonitoramento()
  ];

  for (let i = 0; i < exemplos.length; i++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`EXECUTANDO EXEMPLO ${i + 1} de ${exemplos.length}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      const resultado = await exemplos[i]();
      resultados.push({
        exemplo: i + 1,
        sucesso: resultado.success,
        dados: resultado
      });
    } catch (error) {
      console.error(`❌ Erro fatal no exemplo ${i + 1}:`, error);
      resultados.push({
        exemplo: i + 1,
        sucesso: false,
        erro: error.message
      });
    }

    // Pequena pausa entre exemplos
    if (i < exemplos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Resumo final
  console.log(`\n${'='.repeat(60)}`);
  console.log('RESUMO DA EXECUÇÃO DOS EXEMPLOS');
  console.log(`${'='.repeat(60)}`);

  const sucesso = resultados.filter(r => r.sucesso).length;
  const falhas = resultados.filter(r => !r.sucesso).length;

  console.log(`✅ Exemplos bem-sucedidos: ${sucesso}/${resultados.length}`);
  console.log(`❌ Exemplos com falhas: ${falhas}/${resultados.length}`);

  if (falhas > 0) {
    console.log('\nExemplos com falhas:');
    resultados.filter(r => !r.sucesso).forEach(r => {
      console.log(`   Exemplo ${r.exemplo}: ${r.erro}`);
    });
  }

  return resultados;
}

// Exportar para uso em outros módulos
export default FlowiseCompleteUsage;