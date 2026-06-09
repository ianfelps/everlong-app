import 'server-only';

export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Everlong API',
    version: '0.1.0',
    description:
      'API REST do álbum de memórias do casal. Auth por cookie HttpOnly (evl_session).',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
  ],
  tags: [
    { name: 'health' },
    { name: 'auth' },
    { name: 'perfis' },
    { name: 'fotos' },
    { name: 'cronometro' },
    { name: 'fases' },
    { name: 'eventos' },
    { name: 'capsulas' },
    { name: 'recados' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'evl_session' },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error', 'code'],
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: {},
        },
      },
      Perfil: {
        type: 'object',
        required: ['id', 'nome'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
      Fase: {
        type: 'object',
        required: ['id', 'nome', 'dataInicio', 'ordem'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          dataInicio: { type: 'string', format: 'date' },
          dataFim: { type: 'string', format: 'date', nullable: true },
          ordem: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Foto: {
        type: 'object',
        required: ['id', 'driveFileId', 'mimeType', 'tamanhoBytes', 'uploadedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          faseId: { type: 'string', format: 'uuid', nullable: true },
          autorId: { type: 'string', format: 'uuid', nullable: true },
          driveFileId: { type: 'string' },
          mimeType: { type: 'string' },
          tamanhoBytes: { type: 'string', description: 'bigint serializado' },
          largura: { type: 'integer', nullable: true },
          altura: { type: 'integer', nullable: true },
          legenda: { type: 'string', nullable: true },
          tiradaEm: { type: 'string', format: 'date-time', nullable: true },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      Evento: {
        type: 'object',
        required: ['id', 'titulo', 'dataEvento'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          faseId: { type: 'string', format: 'uuid', nullable: true },
          fotoId: { type: 'string', format: 'uuid', nullable: true },
          titulo: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          dataEvento: { type: 'string', format: 'date-time' },
          icone: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CapsulaMetadata: {
        type: 'object',
        required: ['id', 'autorId', 'titulo', 'dataCriacao', 'dataDesbloqueio'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid' },
          destinatarioId: { type: 'string', format: 'uuid', nullable: true },
          titulo: { type: 'string' },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataDesbloqueio: { type: 'string', format: 'date-time' },
          abertaEm: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CapsulaAberta: {
        allOf: [
          { $ref: '#/components/schemas/CapsulaMetadata' },
          {
            type: 'object',
            required: ['conteudo'],
            properties: { conteudo: { type: 'string' } },
          },
        ],
      },
      Recado: {
        type: 'object',
        required: ['id', 'autorId', 'conteudo', 'cor', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid' },
          conteudo: { type: 'string' },
          cor: { type: 'string' },
          posicaoX: { type: 'integer' },
          posicaoY: { type: 'integer' },
          rotacao: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Cronometro: {
        type: 'object',
        required: [
          'data_inicio', 'anos', 'meses', 'dias',
          'horas', 'minutos', 'segundos', 'total_dias', 'total_segundos',
        ],
        properties: {
          data_inicio: { type: 'string', format: 'date-time' },
          anos: { type: 'integer' },
          meses: { type: 'integer' },
          dias: { type: 'integer' },
          horas: { type: 'integer' },
          minutos: { type: 'integer' },
          segundos: { type: 'integer' },
          total_dias: { type: 'integer' },
          total_segundos: { type: 'integer' },
        },
      },
      Health: {
        type: 'object',
        required: ['status', 'uptime_seconds', 'timestamp', 'checks'],
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded'] },
          uptime_seconds: { type: 'integer' },
          timestamp: { type: 'string', format: 'date-time' },
          checks: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' },
                latency_ms: { type: 'integer' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Não autenticado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Não encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      BadRequest: {
        description: 'Validação falhou',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NoContent: { description: 'Sem conteúdo' },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } },
          },
          503: {
            description: 'degraded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Login (cookie HttpOnly)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['perfil_id', 'senha'],
                properties: {
                  perfil_id: { type: 'string', format: 'uuid' },
                  senha: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          204: { description: 'Login ok; Set-Cookie: evl_session' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: {
            description: 'Bloqueado por rate limit',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Logout',
        responses: { 204: { description: 'Cookie limpo' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['auth'],
        summary: 'Perfil corrente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Perfil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Perfil' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/perfis': {
      get: {
        tags: ['perfis'],
        summary: 'Lista perfis (sem hash) — público',
        responses: {
          200: {
            description: 'Lista',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Perfil' } },
              },
            },
          },
        },
      },
    },
    '/api/cronometro': {
      get: {
        tags: ['cronometro'],
        summary: 'Tempo decorrido fragmentado',
        responses: {
          200: {
            description: 'Cronômetro',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cronometro' } } },
          },
        },
      },
    },
    '/api/fotos': {
      get: {
        tags: ['fotos'],
        summary: 'Lista fotos (paginação cursor)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'fase_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 30 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Página',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'next_cursor'],
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/Foto' } },
                    next_cursor: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['fotos'],
        summary: 'Upload de foto (multipart)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['arquivo'],
                properties: {
                  arquivo: { type: 'string', format: 'binary' },
                  legenda: { type: 'string' },
                  fase_id: { type: 'string', format: 'uuid' },
                  tirada_em: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Criada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Foto' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          413: { description: 'Arquivo > 25MB' },
          415: { description: 'mime não permitido' },
        },
      },
    },
    '/api/fotos/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      get: {
        tags: ['fotos'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Foto', content: { 'application/json': { schema: { $ref: '#/components/schemas/Foto' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['fotos'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  legenda: { type: 'string', nullable: true },
                  fase_id: { type: 'string', format: 'uuid', nullable: true },
                  tirada_em: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Foto' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['fotos'],
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/fotos/{id}/binario': {
      get: {
        tags: ['fotos'],
        summary: 'Stream proxy do Drive',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Binário da imagem',
            content: { 'image/*': { schema: { type: 'string', format: 'binary' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/fases': {
      get: {
        tags: ['fases'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Fase' } } } },
          },
        },
      },
      post: {
        tags: ['fases'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'data_inicio', 'ordem'],
                properties: {
                  nome: { type: 'string' },
                  descricao: { type: 'string' },
                  data_inicio: { type: 'string', format: 'date' },
                  data_fim: { type: 'string', format: 'date', nullable: true },
                  ordem: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Fase' } } } },
        },
      },
    },
    '/api/fases/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      patch: {
        tags: ['fases'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Fase' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['fases'],
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/eventos': {
      get: {
        tags: ['eventos'],
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'fase_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'ordem', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Evento' } } } } },
        },
      },
      post: {
        tags: ['eventos'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'data_evento'],
                properties: {
                  titulo: { type: 'string' },
                  descricao: { type: 'string' },
                  data_evento: { type: 'string', format: 'date-time' },
                  icone: { type: 'string' },
                  fase_id: { type: 'string', format: 'uuid', nullable: true },
                  foto_id: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Evento' } } } },
        },
      },
    },
    '/api/eventos/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      patch: {
        tags: ['eventos'],
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Evento' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['eventos'],
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/capsulas': {
      get: {
        tags: ['capsulas'],
        summary: 'Lista metadata (sem conteúdo)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CapsulaMetadata' } } } } },
        },
      },
      post: {
        tags: ['capsulas'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'conteudo', 'data_desbloqueio'],
                properties: {
                  titulo: { type: 'string' },
                  conteudo: { type: 'string' },
                  data_desbloqueio: { type: 'string', format: 'date-time' },
                  destinatario_id: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/CapsulaMetadata' } } } },
        },
      },
    },
    '/api/capsulas/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      get: {
        tags: ['capsulas'],
        summary: 'Cápsula (423 antes do desbloqueio)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Aberta', content: { 'application/json': { schema: { $ref: '#/components/schemas/CapsulaAberta' } } } },
          423: {
            description: 'Locked',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['capsulas'],
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/recados': {
      get: {
        tags: ['recados'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Recado' } } } } },
        },
      },
      post: {
        tags: ['recados'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conteudo'],
                properties: {
                  conteudo: { type: 'string' },
                  cor: { type: 'string' },
                  posicao_x: { type: 'integer' },
                  posicao_y: { type: 'integer' },
                  rotacao: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Recado' } } } },
        },
      },
    },
    '/api/recados/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      patch: {
        tags: ['recados'],
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Recado' } } } }, 404: { $ref: '#/components/responses/NotFound' } },
      },
      delete: {
        tags: ['recados'],
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
  },
} as const;
