import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { LeaderBoard } from './game.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderBoard]), HttpModule],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
