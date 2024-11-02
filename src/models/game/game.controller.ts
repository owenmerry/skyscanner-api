import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as sanitizeHtml from 'sanitize-html';
import { LeaderBoard } from './game.entity';

@Module({
  imports: [HttpModule],
  providers: [GameService],
})
@Controller()
export class GameController {
  NEON_DB_PGHOST = '';
  NEON_DB_PGDATABASE = '';
  NEON_DB_PGUSER = '';
  NEON_DB_PGPASSWORD = '';
  NEON_DB_CONNECTION = '';
  UNSPLASH_ACCESS_KEY = '';

  constructor(
    private readonly gameService: GameService,
    private configService: ConfigService,
  ) {
    this.NEON_DB_PGHOST =
      this.configService.get<string>('NEON_DB_PGHOST') || '';
    this.NEON_DB_PGDATABASE =
      this.configService.get<string>('NEON_DB_PGDATABASE') || '';
    this.NEON_DB_PGUSER =
      this.configService.get<string>('NEON_DB_PGUSER') || '';
    this.NEON_DB_PGPASSWORD =
      this.configService.get<string>('NEON_DB_PGPASSWORD') || '';
    this.NEON_DB_CONNECTION =
      this.configService.get<string>('NEON_DB_CONNECTION') || '';
    this.UNSPLASH_ACCESS_KEY =
      this.configService.get<string>('UNSPLASH_ACCESS_KEY') || '';
  }

  // @Post('game/save')
  // @ApiExcludeEndpoint()
  // async save(
  //   @Body()
  //   body: {
  //     name: string;
  //     award: 'price-left' | 'stops' | 'round-the-world';
  //     amount: number;
  //   },
  // ): Promise<any> {
  //   const bodySanitize = {
  //     name: sanitizeHtml(body.name, {
  //       allowedTags: [],
  //       allowedAttributes: {},
  //     }),
  //     amount: Number(
  //       sanitizeHtml(body.amount.toString(), {
  //         allowedTags: [],
  //         allowedAttributes: {},
  //       }),
  //     ),
  //   };
  //   return this.gameService.createNewScore({
  //     ...bodySanitize,
  //     award: body.award,
  //   });
  // }
  @Post('game/won')
  @ApiExcludeEndpoint()
  async getWon(
    @Body()
    body: {
      name: string;
      stops: string;
    },
  ): Promise<any> {
    const bodySanitize = {
      name: sanitizeHtml(body.name, {
        allowedTags: [],
        allowedAttributes: {},
      }),
      stops: sanitizeHtml(body.stops, {
        allowedTags: [],
        allowedAttributes: {},
      }),
    };
    const stops = bodySanitize.stops.split(',');
    const award = await this.gameService.getAward(stops);
    if (!award) return false;

    await this.gameService.createNewScore({
      name: bodySanitize.name,
      award: award.award,
      amount: award.amount,
      stops: bodySanitize.stops,
    });

    return {
      name: bodySanitize.name,
      award: award.award,
      amount: award.amount,
      stops: bodySanitize.stops,
    };
  }
  @Get('game/won/test')
  @ApiExcludeEndpoint()
  async getTest(): Promise<any> {
    const award = await this.gameService.getAward([]);
    return award;
  }
  @Get('game/top/price-left')
  @ApiExcludeEndpoint()
  async getPriceLeft(): Promise<any> {
    const list = await this.gameService.getTopPriceScores();
    return list.map((item, key) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      position: key + 1,
      award: item.award,
    }));
  }
  @Get('game/top/price-close')
  @ApiExcludeEndpoint()
  async getPriceClose(): Promise<any> {
    const list = await this.gameService.getClosePriceScores();
    return list.map((item, key) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      position: key + 1,
      award: item.award,
    }));
  }
  @Get('game/top/stops')
  @ApiExcludeEndpoint()
  async getTopStops(): Promise<any> {
    const list = await this.gameService.getMostStopsScores();
    return list.map((item, key) => ({
      id: item.id,
      name: item.name,
      position: key + 1,
      stopsCount: item.getStopsCount(),
      stopOversCount: item.getStopOversCount(),
    }));
  }
}
