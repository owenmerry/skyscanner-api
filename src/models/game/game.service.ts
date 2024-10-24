import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderBoard } from './game.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';

@Injectable()
export class GameService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_API_KEY = '';
  SKYSCANNER_HOTEL_API_URL = '';
  SKYSCANNER_HOTEL_API_KEY = '';

  constructor(
    @InjectRepository(LeaderBoard)
    private leaderBoard: Repository<LeaderBoard>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.SKYSCANNER_API_URL =
      this.configService.get<string>('SKYSCANNER_API_URL') || '';
    this.SKYSCANNER_API_KEY =
      this.configService.get<string>('SKYSCANNER_API_KEY') || '';
    this.SKYSCANNER_HOTEL_API_URL =
      this.configService.get<string>('SKYSCANNER_HOTEL_API_URL') || '';
    this.SKYSCANNER_HOTEL_API_KEY =
      this.configService.get<string>('SKYSCANNER_HOTEL_API_KEY') || '';
  }

  async createNewScore({
    award,
    name,
    amount,
  }: {
    award: 'price-left' | 'stops' | 'round-the-world';
    name: string;
    amount: number;
  }) {
    return await this.leaderBoard.save({
      award,
      name,
      amount,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  async getTopPriceScores() {
    const all = await this.leaderBoard.findBy({ award: 'price-left' });
    return all.sort((a, b) => b.amount - a.amount).slice(0, 10);
  }
  async getClosePriceScores() {
    const all = await this.leaderBoard.findBy({ award: 'price-left' });
    return all.sort((a, b) => a.amount - b.amount).slice(0, 10);
  }
}
