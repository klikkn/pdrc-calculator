import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app/app.module';
import { createTemporaryApp } from './temporary';

bootstrap();

async function bootstrap() {
  const app = await createApp();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('pdrc')
    .setDescription('The pdrc API description')
    .setVersion('1.0')
    .addTag('pdrc')
    .setBasePath(globalPrefix)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

async function createApp() {
  const uri = process.env.DB_URL;

  return uri
    ? NestFactory.create(AppModule.register({ uri }))
    : createTemporaryApp();
}
