import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppLoggerMiddleware } from './middleware/logger.middleware';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatGPTController } from './models/chat-gpt/chat-gpt.controller';
import { ChatGptService } from './models/chat-gpt/chat-gpt.service';
import { ContentController } from './models/content/content.controller';
import { ContentService } from './models/content/content.service';
import { FlightService } from './models/flight/flight.service';
import { FlightController } from './models/flight/flight.controller';
import { FlightCache } from './models/flight/flight.entity';
import { FlightModule } from './models/flight/flight.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NEON_DB_PGHOST,
      port: 5432,
      username: process.env.NEON_DB_PGUSER,
      password: process.env.NEON_DB_PGPASSWORD,
      database: process.env.NEON_DB_PGDATABASE,
      autoLoadEntities: true,
      logging: true,
      synchronize: true, // shouldn't really be used in production - may lose data
      ssl: true,
      entities: [FlightCache],
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    FlightModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController, ChatGPTController, ContentController],
  providers: [AppService, ChatGptService, ContentService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
