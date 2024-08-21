import { Controller, Get, Param, Query } from '@nestjs/common';
import { FlightService } from './flight.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createApi } from 'unsplash-js';
import * as nodeFetch from 'node-fetch';

@Module({
  imports: [HttpModule],
  providers: [FlightService],
})
@Controller()
export class FlightController {
  NEON_DB_PGHOST = '';
  NEON_DB_PGDATABASE = '';
  NEON_DB_PGUSER = '';
  NEON_DB_PGPASSWORD = '';
  NEON_DB_CONNECTION = '';
  UNSPLASH_ACCESS_KEY = '';

  constructor(
    private readonly flightService: FlightService,
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
    const searchHash = await this.flightService.createHash({
      ...query,
      returnDate: query.return,
    });
    const cache = await this.flightService.getCache({ searchHash });
    if (cache) {
      const res = await this.flightService.flightsLivePricesPoll(
        cache.sessionToken,
      );

      return res.data;
    }

    const res = await this.flightService.flightsLivePricesCreate(query);
    const save = await this.flightService.createCache({
      sessionToken: res.data.sessionToken,
      searchHash,
    });

    return res.data;
  }

  @Get('/poll/:token')
  @ApiExcludeEndpoint()
  async getPoll(@Param() params: { token: string }): Promise<any> {
    const res = await this.flightService.flightsLivePricesPoll(params.token);

    return res.data;
  }

  @Get('/price')
  @ApiExcludeEndpoint()
  async getPrice(
    @Query()
    query: {
      from: string;
      month?: number;
      year?: number;
      endMonth?: number;
      endYear?: number;
      tripType?: string;
      groupType?: string;
    },
  ): Promise<any> {
    console.log('check',{
      endMonth: query.endMonth,
      endYear: query.endYear,
    });
    const res = await this.flightService.flightsIndicitiveSearch(query);

    return res.data;
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
    const res = await this.flightService.searchHotels(query);
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
    });

    return imageSearch;
  }

  @Get('/autosuggest/flights/:search')
  @ApiExcludeEndpoint()
  async getAutoSuggestFlights(
    @Param() params: { search: string },
  ): Promise<any> {
    const res = await this.flightService.autoSuggestFlights(params.search);

    return res.data;
  }
}
