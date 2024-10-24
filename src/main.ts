import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_DOMAINS
      ? process.env.CORS_DOMAINS.split(',')
      : [''],
  });

  const config = new DocumentBuilder()
    .setTitle('Flights API')
    .setDescription('Flights API search using skyscanner apis')
    .setVersion('1.0')
    .addServer(process.env.SERVER_HOST || '')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
