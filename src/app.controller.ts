import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { skyscanner } from './helpers/sdk/flight';

@Module({
  imports: [HttpModule],
  providers: [AppService],
})
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/poll/:token')
  async getPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);

    return res.data;
  }

  @Get('/create')
  async getCreate(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsLivePricesCreate(query);

    return res.data;
  }

  @Get('/price')
  async getPrice(): Promise<any> {
    const res = await this.appService.flightsIndicitiveSearch();

    return res.data;
  }

  @Get('/markets')
  async getMarkets(): Promise<any> {
    const res = await this.appService.cultureMarkets();

    return res.data;
  }

  @Get('/locales')
  async getLocales(): Promise<any> {
    const res = await this.appService.cultureLocales();

    return res.data;
  }

  @Get('/currencies')
  async getCurrenciess(): Promise<any> {
    const res = await this.appService.cultureCurrencies();

    return res.data;
  }

  @Get('/geo')
  async getGeo(): Promise<any> {
    const res = await this.appService.geo();

    return res.data;
  }
  @Get('/autosuggest/flights/:search')
  async getAutoSuggestFlights(
    @Param() params: { search: string },
  ): Promise<any> {
    const res = await this.appService.autoSuggestFlights(params.search);

    return res.data;
  }

  @Get('/search')
  async getSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsLivePricesCreate(query);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/search/:token')
  async getSearchPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/hotel/search')
  async getHotelSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
      entityId: string;
    },
  ): Promise<any> {
    const res = await this.appService.searchHotels(query);
    const data = res.data;

    return data;
  }
}
