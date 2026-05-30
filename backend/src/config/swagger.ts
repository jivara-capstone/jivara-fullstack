import swaggerJsdoc from 'swagger-jsdoc';

const getServers = () => {
  const servers: Array<{ url: string; description: string }> = [];

  if (process.env.NODE_ENV === 'production') {
    servers.push({
      url: process.env.API_URL || 'https://api.jivara.web.id',
      description: '',
    });
  } else {
    servers.push({
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: '',
    });
  }

  return servers;
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jivara API Docs',
      version: '1.0.0',
      contact: {
        name: 'Jivara',
      },
    },
    servers: getServers(),
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token akses',
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/routes/*.ts'], // Path ke dokumentasi API
};

type OpenApiRecord = Record<string, unknown>;

type OpenApiResponse = OpenApiRecord & {
  description?: string;
  content?: OpenApiRecord;
};

const isRecord = (value: unknown): value is OpenApiRecord => typeof value === 'object' && value !== null && !Array.isArray(value);

const getStatusText = (statusCode: string) => {
  const statusMap: Record<string, string> = {
    200: 'Permintaan berhasil diproses',
    201: 'Data berhasil dibuat',
    400: 'Payload atau parameter tidak valid',
    401: 'Tidak terautentikasi',
    403: 'Tidak memiliki izin untuk mengakses resource ini',
    404: 'Resource tidak ditemukan',
    409: 'Data konflik dengan resource yang sudah ada',
    422: 'Data tidak dapat diproses',
    429: 'Terlalu banyak permintaan',
    500: 'Terjadi kesalahan pada server',
  };

  return statusMap[statusCode] || (statusCode.startsWith('2') ? 'Permintaan berhasil diproses' : 'Terjadi kesalahan');
};

const createResponseExample = (statusCode: string, description?: string) => {
  const message = description || getStatusText(statusCode);

  if (statusCode.startsWith('2')) {
    return {
      status: 'berhasil',
      message,
      data: {},
    };
  }

  return {
    status: 'gagal',
    message,
    error_code: 'ERROR',
  };
};

const createResponseSchema = (statusCode: string) => {
  if (statusCode.startsWith('2')) {
    return {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'berhasil' },
        message: { type: 'string' },
        data: {
          nullable: true,
          oneOf: [
            { type: 'object' },
            { type: 'array', items: {} },
            { type: 'string' },
            { type: 'boolean' },
          ],
        },
        meta: { type: 'object' },
      },
    };
  }

  return {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'gagal' },
      message: { type: 'string' },
      error_code: { type: 'string' },
    },
  };
};

const ensureResponseBodies = (paths: Record<string, unknown>) => {
  Object.values(paths).forEach((pathItem) => {
    if (!isRecord(pathItem)) return;

    Object.values(pathItem).forEach((operation) => {
      if (!isRecord(operation) || !isRecord(operation.responses)) return;

      Object.entries(operation.responses).forEach(([statusCode, response]) => {
        if (!isRecord(response)) return;

        const openApiResponse = response as OpenApiResponse;
        const fallbackMediaType = {
          schema: createResponseSchema(statusCode),
          example: createResponseExample(statusCode, openApiResponse.description),
        };

        if (!isRecord(openApiResponse.content) || Object.keys(openApiResponse.content).length === 0) {
          openApiResponse.content = {
            'application/json': fallbackMediaType,
          };
          return;
        }

        const jsonContent = openApiResponse.content['application/json'];
        if (!isRecord(jsonContent)) {
          openApiResponse.content['application/json'] = fallbackMediaType;
          return;
        }

        if (!isRecord(jsonContent.schema)) {
          jsonContent.schema = fallbackMediaType.schema;
        }

        if (!('example' in jsonContent) && !('examples' in jsonContent)) {
          jsonContent.example = fallbackMediaType.example;
        }
      });
    });
  });
};

const spec = swaggerJsdoc(options) as { paths?: Record<string, unknown> };

if (spec.paths) {
  spec.paths = Object.fromEntries(
    Object.entries(spec.paths).map(([path, value]) => [
      path.startsWith('/api/v1/') ? path : path.startsWith('/api/') ? path.replace('/api/', '/api/v1/') : path,
      value,
    ]),
  );
  ensureResponseBodies(spec.paths);
}

export const swaggerSpec = spec;
