import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as sanitizeHtml from 'sanitize-html';

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

  @Post('game/save')
  @ApiExcludeEndpoint()
  async save(
    @Body()
    body: {
      name: string;
      award: 'price-left' | 'stops' | 'round-the-world';
      amount: number;
    },
  ): Promise<any> {
    const bodySanitize = {
      name: sanitizeHtml(body.name, {
        allowedTags: [],
        allowedAttributes: {},
      }),
      amount: Number(
        sanitizeHtml(body.amount.toString(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
      ),
    };
    return this.gameService.createNewScore({
      ...bodySanitize,
      award: body.award,
    });
  }
  @Get('game/top/price-left')
  @ApiExcludeEndpoint()
  async getPriceLeft(): Promise<any> {
    return this.gameService.getTopPriceScores();
  }
  @Get('game/top/price-close')
  @ApiExcludeEndpoint()
  async getClosePrice(): Promise<any> {
    return this.gameService.getClosePriceScores();
  }
  @Get('game/sanitize')
  @ApiExcludeEndpoint()
  async getSanitizr(): Promise<any> {
    try{
      return sanitizeHtml('<b>done bold</b>', {
        allowedTags: [],
        allowedAttributes: {},
      });
    } catch (error) {
      return `error: ${error}`;
    }
  }
}
