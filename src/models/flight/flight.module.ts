import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { FlightCache } from './flight.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([FlightCache]), HttpModule],
  providers: [FlightService],
  controllers: [FlightController],
})
export class FlightModule {}
