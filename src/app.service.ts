import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import type { SkyscannerAPIIndicitiveResponse } from './helpers/sdk/indicitive';
import moment from 'moment';

@Injectable()
export class AppService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_API_KEY = '';
  SKYSCANNER_HOTEL_API_URL = '';
  SKYSCANNER_HOTEL_API_KEY = '';

  constructor(
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

  flightsRefreshCreate(query: {
    token: string;
    itineraryId: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/live/itineraryrefresh/create/${query.token}`,
      {
        itineraryId: query.itineraryId,
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  flightsRefreshPoll(sessionToken: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/live/itineraryrefresh/poll/${sessionToken}`,
      {},
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  flightsIndicitiveSearch2(query: {
    month?: number;
    endMonth?: number;
    from: string;
    to?: string;
    groupType?: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef
      .post(
        `${this.SKYSCANNER_API_URL}/flights/indicative/search`,
        {
          query: {
            currency: 'GBP',
            locale: 'en-GB',
            market: 'UK',
            dateTimeGroupingType:
              query.groupType === 'month'
                ? 'DATE_TIME_GROUPING_TYPE_BY_MONTH'
                : 'DATE_TIME_GROUPING_TYPE_BY_DATE',
            queryLegs: [
              {
                originPlace: {
                  queryPlace: {
                    entityId: query.from,
                  },
                },
                destinationPlace: {
                  ...(query?.to && query.to !== 'anywhere'
                    ? {
                        queryPlace: {
                          entityId: query.to,
                        },
                      }
                    : { anywhere: true }),
                },
                dateRange: {
                  startDate: {
                    year: 2024,
                    month: query?.month || new Date().getMonth() + 1,
                  },
                  endDate: {
                    year: 2024,
                    month: query?.month || new Date().getMonth() + 1,
                  },
                },
              },
              {
                originPlace: {
                  ...(query?.to && query.to !== 'anywhere'
                    ? {
                        queryPlace: {
                          entityId: query.to,
                        },
                      }
                    : { anywhere: true }),
                },
                destinationPlace: {
                  queryPlace: {
                    entityId: query.from,
                  },
                },
                dateRange: {
                  startDate: {
                    year: 2024,
                    month:
                      query?.endMonth ||
                      query?.month ||
                      new Date().getMonth() + 1,
                  },
                  endDate: {
                    year: 2024,
                    month:
                      query?.endMonth ||
                      query?.month ||
                      new Date().getMonth() + 1,
                  },
                },
              },
            ],
          },
        },
        {
          headers: {
            'x-api-key': this.SKYSCANNER_API_KEY,
          },
        },
      )
      .catch((err) => {
        throw new InternalServerErrorException(err.message);
      });
  }

  cultureMarkets(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_API_URL}/culture/markets/en-GB`,
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  cultureLocales(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_API_URL}/culture/locales`,
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  cultureCurrencies(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_API_URL}/culture/currencies`,
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  carriers(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_API_URL}/flights/carriers`,
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  geo(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_API_URL}/geo/hierarchy/flights/en-GB`,
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  autoSuggestFlights(search: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/autosuggest/flights`,
      {
        query: {
          market: 'UK',
          locale: 'en-GB',
          searchTerm: search,
          includedEntityTypes: ['PLACE_TYPE_CITY', 'PLACE_TYPE_AIRPORT'],
        },
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }
}
