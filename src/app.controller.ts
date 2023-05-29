import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchSDK } from './helpers/sdk/flight';
import type { IndicitiveQuote, IndicitiveLeg, SkyscannerAPIIndicitiveResponse } from './helpers/sdk/indicitive';
import { skyscanner } from './helpers/sdk/flight';
import { getPrice } from './helpers/sdk/price';
import { Search } from './helpers/dto/flight';
import { ChatGPTDescription } from './helpers/dto/chatgpt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful'
import { createApi } from 'unsplash-js';
import * as nodeFetch from 'node-fetch'


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

  constructor(private readonly appService: AppService, private configService: ConfigService,) {
    this.CONTENTFUL_SPACE =
      this.configService.get<string>('CONTENTFUL_SPACE') || '';
    this.CONTENTFUL_ENVIRONMENT =
      this.configService.get<string>('CONTENTFUL_ENVIRONMENT') || '';
    this.CONTENTFUL_ACCESS_TOKEN =
      this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN') || '';
    this.UNSPLASH_ACCESS_KEY =
      this.configService.get<string>('UNSPLASH_ACCESS_KEY') || '';
  }

  @Get('/poll/:token')
  @ApiExcludeEndpoint()
  async getPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);

    return res.data;
  }

  @Get('/create')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  async getPrice(
    @Query()
    query: {
      from: string;
      month?: number;
      groupType?: string;
    },
  ): Promise<any> {
    const res = await this.appService.flightsIndicitiveSearch(query);

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

  @Get('/search')
  @ApiExcludeEndpoint()
  @ApiResponse({
    status: 200,
    description: 'Creates a flight search',
    type: Search,
  })
  @ApiQuery({ name: 'from', required: true, description: 'IATA location flight origin' })
  @ApiQuery({ name: 'to', required: true, description: 'IATA location flight destination' })
  @ApiQuery({ name: 'depart', required: true, description: 'Depature date of the flight in yyyy-mm-dd format' })
  @ApiQuery({ name: 'return', required: false, description: 'Return date of the flight in yyyy-mm-dd format' })
  async getSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    console.log('/search endpoint accessed')
    const res = await this.appService.flightsLivePricesSearchChatGPT(query);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/search/:token')
  @ApiExcludeEndpoint()
  @ApiParam({ name: 'token', required: true, description: 'sessionToken from the create search `/create` endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns flight search using token to get full results',
  })
  async getSearchPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.appService.flightsLivePricesPoll(params.token);
    const data = skyscanner(res.data).search();

    return data;
  }

  @Get('/hotel/search')
  @ApiExcludeEndpoint()
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





  @Get('/images')
  @ApiExcludeEndpoint()
  async getUnsplashImages(
    @Query()
    query: {
      query: string;
    },
  ): Promise<any> {

    // on your node server
    const serverApi = createApi({
      accessKey: this.UNSPLASH_ACCESS_KEY,
      fetch: nodeFetch as unknown as typeof fetch,
    });

    const imageSearch = await serverApi.search.getPhotos({
      query: query.query,
      orientation: 'landscape',
    })

    return imageSearch;

  }

}
