import { buildApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { JobScheduler } from './jobs/scheduler.js';

async function bootstrap() {
  try {
    // 1. Connect Database
    await connectDatabase();

    // 2. Build Fastify App
    const app = await buildApp();

    // 3. Start Background Schedulers
    JobScheduler.startJobs();

    // 4. Start HTTP Server
    const address = await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`\n======================================================`);
    console.log(`🚀 Loyalty Platform API running at: ${address}`);
    console.log(`📚 Interactive Swagger Docs at:    ${address}/docs`);
    console.log(`🩺 Healthcheck probe at:          ${address}/health`);
    console.log(`🌍 Environment:                    ${env.NODE_ENV}`);
    console.log(`⚡ Powered by:                      Fastify & TypeScript`);
    console.log(`======================================================\n`);

    // Graceful Shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 [Shutdown] Received signal ${signal}. Starting graceful shutdown...`);
      JobScheduler.stopJobs();
      await app.close();
      await disconnectDatabase();
      console.log('👋 [Shutdown] Graceful shutdown completed. Exiting.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ [Unhandled Rejection]:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ [Uncaught Exception]:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ [Bootstrap Error]:', error);
    process.exit(1);
  }
}

bootstrap();
