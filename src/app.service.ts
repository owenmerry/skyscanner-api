import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_API_KEY = '';

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.SKYSCANNER_API_URL =
      this.configService.get<string>('SKYSCANNER_API_URL') || '';
    this.SKYSCANNER_API_KEY =
      this.configService.get<string>('SKYSCANNER_API_KEY') || '';
  }

  flightsLivePricesCreate(query: {
    from: string;
    to: string;
    depart: string;
    return: string;
  }): Promise<AxiosResponse<any>> {
    const hasReturn = !!query.return;
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/live/search/create`,
      {
        query: {
          market: 'UK',
          locale: 'en-GB',
          currency: 'GBP',
          queryLegs: [
            {
              originPlaceId: {
                entityId: query.from,
              },
              destinationPlaceId: {
                entityId: query.to,
              },
              date: {
                year: Number(query.depart.split('-')[0]),
                month: Number(query.depart.split('-')[1]),
                day: Number(query.depart.split('-')[2]),
              },
            },
          ],
          ...(hasReturn && {
            queryLegs: [
              {
                originPlaceId: {
                  entityId: query.from,
                },
                destinationPlaceId: {
                  entityId: query.to,
                },
                date: {
                  year: Number(query.depart.split('-')[0]),
                  month: Number(query.depart.split('-')[1]),
                  day: Number(query.depart.split('-')[2]),
                },
              },
              {
                originPlaceId: {
                  entityId: query.to,
                },
                destinationPlaceId: {
                  entityId: query.from,
                },
                date: {
                  year: Number(query.return.split('-')[0]),
                  month: Number(query.return.split('-')[1]),
                  day: Number(query.return.split('-')[2]),
                },
              },
            ],
          }),
          adults: 1,
          childrenAges: [],
          cabinClass: 'CABIN_CLASS_ECONOMY',
          excludedAgentsIds: [],
          excludedCarriersIds: [],
          includedAgentsIds: [],
          includedCarriersIds: [],
        },
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  flightsLivePricesPoll(sessionToken: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/live/search/poll/${sessionToken}`,
      {},
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  flightsIndicitiveSearch(): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/indicative/search`,
      {
        query: {
          currency: 'GBP',
          locale: 'en-GB',
          excludedWebsites: [''],
          market: 'UK',
          queryLegs: [
            {
              destinationPlace: {
                queryPlace: {
                  iata: 'EDI',
                },
              },
              originPlace: {
                queryPlace: {
                  iata: 'LHR',
                },
              },
              anytime: true,
            },
          ],
        },
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
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
