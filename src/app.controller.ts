import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [AppService],
})
@Controller()
export class AppController {
  CONTENTFUL_SPACE = '';
  CONTENTFUL_ENVIRONMENT = '';
  CONTENTFUL_ACCESS_TOKEN = '';
  UNSPLASH_ACCESS_KEY = '';

  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {
    this.CONTENTFUL_SPACE =
      this.configService.get<string>('CONTENTFUL_SPACE') || '';
    this.CONTENTFUL_ENVIRONMENT =
      this.configService.get<string>('CONTENTFUL_ENVIRONMENT') || '';
    this.CONTENTFUL_ACCESS_TOKEN =
      this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN') || '';
    this.UNSPLASH_ACCESS_KEY =
      this.configService.get<string>('UNSPLASH_ACCESS_KEY') || '';
  }

  @Get('/refresh')
  @ApiExcludeEndpoint()
  async getRefresh(
    @Query()
    query: {
      token: string;
      itineraryId: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsRefreshCreate(query);

    return res.data;
  }

  @Get('/refresh/:token')
  @ApiExcludeEndpoint()
  async getRefreshPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsRefreshPoll(params.token);

    return res.data;
  }

  @Get('/markets')
  @ApiExcludeEndpoint()
  async getMarkets(): Promise<any> {
    const res = await this.appService.cultureMarkets();

    return res.data;
  }

  @Get('/locales')
  @ApiExcludeEndpoint()
  async getLocales(): Promise<any> {
    const res = await this.appService.cultureLocales();

    return res.data;
  }

  @Get('/carriers')
  @ApiExcludeEndpoint()
  async getCarriers(): Promise<any> {
    const res = await this.appService.carriers();

    return res.data;
  }

  @Get('/currencies')
  @ApiExcludeEndpoint()
  async getCurrenciess(): Promise<any> {
    const res = await this.appService.cultureCurrencies();

    return res.data;
  }

  @Get('/geo')
  @ApiExcludeEndpoint()
  async getGeo(): Promise<any> {
    const res = await this.appService.geo();

    return res.data;
  }
  @Get('/autosuggest/flights/:search')
  @ApiExcludeEndpoint()
  async getAutoSuggestFlights(
    @Param() params: { search: string },
  ): Promise<any> {
    const res = await this.appService.autoSuggestFlights(params.search);

    return res.data;
  }
}
