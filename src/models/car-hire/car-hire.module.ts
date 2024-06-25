import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarHireService } from './car-hire.service';
import { CarHireController } from './car-hire.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CarHireService],
  controllers: [CarHireController],
})
export class CarHireModule {}
