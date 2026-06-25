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
      { url: 'http://localhost:3000' },
      { url: 'https://loyalty-program-murex.vercel.app' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = {
  '/api/v1/point': {
    get: {
      summary: 'جلب نقاط الشركة الخاصة بالمسؤول الحالي',
      responses: { 200: { description: 'تم جلب البيانات بنجاح' } },
    },
    post: {
      summary: 'إنشاء نظام نقاط جديد للشركة',
      responses: { 201: { description: 'تم إنشاء نظام النقاط بنجاح' } },
    },
  },
  '/api/v1/point/{id}': {
    patch: {
      summary: 'تحديث بيانات نظام النقاط بواسطة الـ ID',
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'تم التحديث بنجاح' } },
    },
    delete: {
      summary: 'حذف نظام النقاط بواسطة الـ ID',
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      ],
      responses: { 204: { description: 'تم الحذف بنجاح' } },
    },
  },
};

const swaggerUiOptions = {
  customCssUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
};

export const swaggerDocs = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );
};
