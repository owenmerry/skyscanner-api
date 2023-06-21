import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChatGPTController } from './models/chat-gpt/chat-gpt.controller';
import { AppService } from './app.service';
import { ChatGptService } from './models/chat-gpt/chat-gpt.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppLoggerMiddleware } from './middleware/logger.middleware';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController, ChatGPTController],
  providers: [AppService, ChatGptService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppLoggerMiddleware)
      .forRoutes('*');
  }
}
