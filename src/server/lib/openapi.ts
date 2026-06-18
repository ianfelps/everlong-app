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
    { name: 'eventos' },
    { name: 'capsulas' },
    { name: 'recados' },
    { name: 'filmes' },
    { name: 'assistidos' },
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
        },
      },
      Foto: {
        type: 'object',
        required: ['id', 'driveFileId', 'mimeType', 'tamanhoBytes', 'uploadedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid', nullable: true },
          driveFileId: { type: 'string' },
          mimeType: { type: 'string' },
          tamanhoBytes: { type: 'string', description: 'bigint serializado' },
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
          titulo: { type: 'string' },
          descricao: { type: 'string', nullable: true },
          dataEvento: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CapsulaMetadata: {
        type: 'object',
        required: ['id', 'autorId', 'titulo', 'dataCriacao', 'dataDesbloqueio'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid' },
          titulo: { type: 'string' },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataDesbloqueio: { type: 'string', format: 'date-time' },
          abertaEm: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CapsulaFoto: {
        type: 'object',
        required: ['id', 'mimeType', 'tamanhoBytes', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          mimeType: { type: 'string' },
          tamanhoBytes: { type: 'string', description: 'bigint serializado' },
          legenda: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CapsulaAberta: {
        allOf: [
          { $ref: '#/components/schemas/CapsulaMetadata' },
          {
            type: 'object',
            required: ['conteudo'],
            properties: {
              conteudo: { type: 'string' },
              fotos: {
                type: 'array',
                items: { $ref: '#/components/schemas/CapsulaFoto' },
              },
            },
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
      Filme: {
        type: 'object',
        required: ['id', 'tmdbId', 'titulo', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          tmdbId: { type: 'integer' },
          titulo: { type: 'string' },
          posterPath: { type: 'string', nullable: true },
          ano: { type: 'integer', nullable: true },
          sinopse: { type: 'string', nullable: true },
          adicionadoPor: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FilmeTmdb: {
        type: 'object',
        required: ['tmdbId', 'titulo'],
        properties: {
          tmdbId: { type: 'integer' },
          titulo: { type: 'string' },
          posterPath: { type: 'string', nullable: true },
          ano: { type: 'integer', nullable: true },
          sinopse: { type: 'string', nullable: true },
        },
      },
      Avaliacao: {
        type: 'object',
        required: ['id', 'filmeId', 'autorId', 'nota', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          filmeId: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid' },
          nota: { type: 'integer', minimum: 1, maximum: 5 },
          texto: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Favorito: {
        type: 'object',
        required: ['id', 'filmeId', 'autorId', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          filmeId: { type: 'string', format: 'uuid' },
          autorId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AssistidoJunto: {
        type: 'object',
        required: ['id', 'filmeId', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          filmeId: { type: 'string', format: 'uuid' },
          dataAssistido: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      FilmeAgregado: {
        allOf: [
          { $ref: '#/components/schemas/Filme' },
          {
            type: 'object',
            properties: {
              avaliacoes: {
                type: 'array',
                items: { $ref: '#/components/schemas/Avaliacao' },
              },
              favoritos: {
                type: 'array',
                items: { $ref: '#/components/schemas/Favorito' },
              },
              assistidoJunto: {
                oneOf: [
                  { $ref: '#/components/schemas/AssistidoJunto' },
                  { type: 'null' },
                ],
              },
            },
          },
        ],
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
    '/api/eventos': {
      get: {
        tags: ['eventos'],
        security: [{ cookieAuth: [] }],
        parameters: [
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
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['titulo', 'conteudo', 'data_desbloqueio'],
                properties: {
                  titulo: { type: 'string' },
                  conteudo: { type: 'string' },
                  data_desbloqueio: { type: 'string', format: 'date-time' },
                  fotos: {
                    type: 'array',
                    maxItems: 10,
                    items: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/CapsulaMetadata' } } } },
          400: { description: 'Payload inválido ou limite de fotos excedido' },
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
        summary: 'Exclui uma cápsula já aberta',
        security: [{ cookieAuth: [] }],
        responses: {
          204: { $ref: '#/components/responses/NoContent' },
          409: {
            description: 'A cápsula ainda não foi aberta',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/capsulas/{id}/fotos/{fotoId}/binario': {
      get: {
        tags: ['capsulas'],
        summary: 'Stream de foto de cápsula desbloqueada',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'fotoId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Binário da imagem',
            content: { 'image/*': { schema: { type: 'string', format: 'binary' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          423: { description: 'Locked' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/recados': {
      get: {
        tags: ['recados'],
        summary: 'Até 8 recados criados nos últimos 7 dias',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['desc', 'asc'], default: 'desc' },
          },
        ],
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
    '/api/filmes': {
      get: {
        tags: ['filmes'],
        summary: 'Catálogo de filmes do casal',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Filme' } } } } },
        },
      },
      post: {
        tags: ['filmes'],
        summary: 'Adiciona filme ao catálogo via TMDB (idempotente)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tmdb_id'],
                properties: { tmdb_id: { type: 'integer' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Adicionado (ou já existente)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Filme' } } } },
          502: { description: 'TMDB indisponível' },
        },
      },
    },
    '/api/filmes/buscar': {
      get: {
        tags: ['filmes'],
        summary: 'Busca filmes no TMDB (não grava)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500, default: 1 } },
        ],
        responses: {
          200: { description: 'Resultados TMDB', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/FilmeTmdb' } } } } },
          502: { description: 'TMDB indisponível' },
        },
      },
    },
    '/api/filmes/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      get: {
        tags: ['filmes'],
        summary: 'Filme com avaliações, favoritos e flag de assistido',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Agregado', content: { 'application/json': { schema: { $ref: '#/components/schemas/FilmeAgregado' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['filmes'],
        summary: 'Remove filme do catálogo (cascade)',
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/filmes/{id}/avaliacoes': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      put: {
        tags: ['filmes'],
        summary: 'Cria/atualiza avaliação do perfil corrente',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nota'],
                properties: {
                  nota: { type: 'integer', minimum: 1, maximum: 5 },
                  texto: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Salva', content: { 'application/json': { schema: { $ref: '#/components/schemas/Avaliacao' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['filmes'],
        summary: 'Remove a avaliação do perfil corrente',
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/filmes/{id}/favorito': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      put: {
        tags: ['filmes'],
        summary: 'Marca filme como favorito do perfil corrente',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Favoritado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Favorito' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['filmes'],
        summary: 'Desfavorita',
        security: [{ cookieAuth: [] }],
        responses: { 204: { $ref: '#/components/responses/NoContent' } },
      },
    },
    '/api/assistidos-juntos': {
      get: {
        tags: ['assistidos'],
        summary: 'Lista de filmes assistidos juntos (cronológica)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AssistidoJunto' } } } } },
        },
      },
      post: {
        tags: ['assistidos'],
        summary: 'Marca filme como assistido junto (idempotente)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['filme_id'],
                properties: {
                  filme_id: { type: 'string', format: 'uuid' },
                  data_assistido: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Marcado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AssistidoJunto' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/assistidos-juntos/{filmeId}': {
      delete: {
        tags: ['assistidos'],
        summary: 'Desmarca assistido junto',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'filmeId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 204: { $ref: '#/components/responses/NoContent' } },
      },
    },
  },
} as const;
