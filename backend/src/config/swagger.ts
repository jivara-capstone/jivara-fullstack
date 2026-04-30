import swaggerJsdoc from 'swagger-jsdoc';

const getServers = () => {
  const servers: Array<{ url: string; description: string }> = [];

  if (process.env.NODE_ENV === 'production') {
    servers.push({
      url: process.env.API_URL || 'https://jivara-production.up.railway.app',
      description: 'Production server',
    });
  } else {
    servers.push({
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: 'Development server',
    });
  }

  return servers;
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jivara API',
      version: '1.0.0',
      description: 'API RESTful Jivara - Platform Kesehatan Berbasis AI. Untuk endpoint yang membutuhkan autentikasi, login ke /api/auth/login, salin data.access_token, klik Authorize, lalu isi token tanpa awalan Bearer.',
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
          description: 'Masukkan access_token dari endpoint /api/auth/login. Isi token saja tanpa awalan Bearer.',
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/routes/*.ts'], // Path ke dokumentasi API
};

export const swaggerSpec = swaggerJsdoc(options);
