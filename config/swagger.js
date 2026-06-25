import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rehletna API',
      version: '1.0.0',
      description: 'Auth + Loyalty System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
      {
        url: 'https://loyalty-program-murex.vercel.app',
      },
    ],
  },
  apis: ['./controllers/*.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
