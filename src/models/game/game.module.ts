import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { LeaderBoard } from './game.entity';
import { HttpModule } from '@nestjs/axios';
import { FlightService } from '../flight/flight.service';
import { FlightCache, FlightHistoryPrice } from '../flight/flight.entity';
import { FlightModule } from '../flight/flight.module';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderBoard]), FlightModule, HttpModule],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
