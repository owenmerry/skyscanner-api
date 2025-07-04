import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FlightService } from './flight.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createApi } from 'unsplash-js';
import * as nodeFetch from 'node-fetch';
import { getPriceRaw } from '../../helpers/sdk/price';
import { createEditKey } from '../../helpers/sdk/hash';

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
      mode?: 'complete';
    },
  ): Promise<any> {
    throw new Error('Error');
    const searchHash = await this.flightService.createHash({
      ...query,
      returnDate: query.return,
    });
    // const cache = await this.flightService.getCache({ searchHash });
    // const cache = await this.flightService.getCache({ searchHash });
    // if (cache) {
    //   const res = await this.flightService.flightsLivePricesPoll(
    //     cache.sessionToken,
    //   );

    //   return res.data;
    // }

    const res = await this.flightService.flightsLivePricesCreate(query);
    // await this.flightService.createCache({
    //   sessionToken: res.data.sessionToken,
    //   searchHash,
    // });

    if (
      query.mode === 'complete' &&
      res.data.status !== 'RESULT_STATUS_COMPLETE'
    ) {
      return {
        status: 'RESULT_STATUS_INCOMPLETE',
        sessionToken: res.data.sessionToken,
      };
    }

    return res.data;
  }

  @Get('/poll/:token')
  @ApiExcludeEndpoint()
  async getPoll(
    @Param() params: { token: string },
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
      mode?: 'complete';
    },
  ): Promise<any> {
    throw new Error('Error');
    const res = await this.flightService.flightsLivePricesPoll(params.token);

    if (query.from && res.data.status === 'RESULT_STATUS_COMPLETE') {
      const searchHash = await this.flightService.createHash({
        ...query,
        returnDate: query.return,
      });
      this.flightService.createHistoryPrice({
        searchHash,
        price: getPriceRaw(
          res.data.content.stats.itineraries.total.minPrice.amount,
          res.data.content.stats.itineraries.total.minPrice.unit,
        ),
      });

      return res.data;
    }

    if (query.mode === 'complete')
      return {
        status: 'RESULT_STATUS_INCOMPLETE',
      };

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
    throw new Error('Error');
    console.log('check', {
      endMonth: query.endMonth,
      endYear: query.endYear,
    });
    const res = await this.flightService.flightsIndicitiveSearch(query);

    return res.data;
  }

  @Get('/flight/history')
  @ApiExcludeEndpoint()
  async getFlightHistory(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    throw new Error('Error');
    const searchHash = await this.flightService.createHash({
      ...query,
      returnDate: query.return,
    });
    const prices = await this.flightService.getHistoryPrice({ searchHash });
    if (prices) {
      return prices;
    }

    return Error;
  }

  @Get('/autosuggest/flights/:search')
  @ApiExcludeEndpoint()
  async getAutoSuggestFlights(
    @Param() params: { search: string },
    @Query() query: { types: string },
  ): Promise<any> {
    const res = await this.flightService.autoSuggestFlights(params.search, {
      types: query.types,
    });

    return res.data;
  }

  @Get('/autosuggest/hotels/:search')
  @ApiExcludeEndpoint()
  async getAutoSuggestHotels(
    @Param() params: { search: string },
    @Query() query: { types: string },
  ): Promise<any> {
    const res = await this.flightService.autoSuggestHotels(params.search, {
      types: query.types,
    });

    return res.data;
  }

  // move below

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
        throw new Error('Error');
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
        throw new Error('Error');
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

  @Get('flights/geo/nearest')
  @ApiExcludeEndpoint()
  async getGeoNearest(
    @Query()
    query: {
      latitude: number;
      longitude: number;
    },
  ): Promise<any> {
    const res = await this.flightService.geoNearest(query);

    return res.data;
  }

  @Get('trip/details/create')
  @ApiExcludeEndpoint()
  async createTripDetails(
    @Query()
    query: {
      cityEntityId: string;
      trip: any;
    },
  ): Promise<any> {
    const hash = createEditKey();
    const res = await this.flightService.createTripDetails({
      cityEntityId: query.cityEntityId,
      editHash: hash,
      trip: JSON.stringify(query.trip),
    });

    return res;
  }

  @Post('trip/details/create')
  @ApiExcludeEndpoint()
  async createTripDetailsPost(
    @Body()
    body: {
      cityEntityId: string;
      trip: any;
    },
  ): Promise<any> {
    const hash = createEditKey();
    const res = await this.flightService.createTripDetails({
      cityEntityId: body.cityEntityId,
      editHash: hash,
      trip: JSON.stringify(body.trip),
    });

    return res;
  }

  @Get('trip/details/update')
  @ApiExcludeEndpoint()
  async editTripDetails(
    @Query()
    query: {
      id: number;
      editHash: string;
      cityEntityId: string;
      trip: any;
    },
  ): Promise<any> {
    const res = await this.flightService.editTripDetails({
      id: query.id,
      cityEntityId: query.cityEntityId,
      editHash: query.editHash,
      trip: JSON.stringify(query.trip),
    });

    return res;
  }

  @Get('trip/details/all')
  @ApiExcludeEndpoint()
  async getAllTripDetails(): Promise<any> {
    const res = await this.flightService.getAllTripDetails();

    return res;
  }

  @Get('trip/details/:id')
  @ApiExcludeEndpoint()
  async getTripDetails(@Param() params: { id: number }): Promise<any> {
    const res = await this.flightService.getTripDetails({
      id: params.id,
    });

    return res;
  }
}
