import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FlightCache, FlightHistoryPrice, TripDetails } from './flight.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class FlightService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_API_KEY = '';
  SKYSCANNER_HOTEL_API_URL = '';
  SKYSCANNER_HOTEL_API_KEY = '';

  constructor(
    @InjectRepository(FlightCache)
    private flightCacheRepository: Repository<FlightCache>,
    @InjectRepository(TripDetails)
    private tripDetailsRepository: Repository<TripDetails>,
    @InjectRepository(FlightHistoryPrice)
    private flightHistoryPriceRepository: Repository<FlightHistoryPrice>,
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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async runEveryTenMinute() {
    await this.flightCacheRepository
      .createQueryBuilder('created_at')
      .delete()
      .where('created_at < :currentDate', {
        currentDate: moment()
          .subtract(40, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
      })
      .execute();
  }

  // @Cron(CronExpression.EVERY_HOUR)
  // async runEveryHour() {
  //   //cancun
  //   const query = {
  //     from: '27544008',
  //     to: '27540602',
  //     depart: '2024-11-08',
  //     return: '2024-11-24',
  //   };
  //   const create = await this.flightsLivePricesCreate({
  //     ...query,
  //   });

  //   await waitMinutes(2);

  //   const poll = await this.flightsLivePricesPoll(create.data.sessionToken);

  //   if (poll.data.status === 'RESULT_STATUS_COMPLETE') {
  //     const searchHash = await this.createHash({
  //       ...query,
  //       returnDate: query.return,
  //     });
  //     this.createHistoryPrice({
  //       searchHash,
  //       price: getPriceRaw(
  //         poll.data.content.stats.itineraries.total.minPrice.amount,
  //         poll.data.content.stats.itineraries.total.minPrice.unit,
  //       ),
  //     });
  //   }
  // }

  async createCache({
    sessionToken,
    searchHash,
  }: {
    sessionToken?: string;
    searchHash: string;
  }) {
    if (!sessionToken) return;
    return await this.flightCacheRepository.save({
      sessionToken,
      searchHash,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  async createTripDetails({
    cityEnityId,
    editHash,
    trip,
  }: {
    cityEnityId: string;
    editHash: string;
    trip: string;
  }) {
    return await this.tripDetailsRepository.save({
      cityEnityId,
      editHash,
      trip,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  async editTripDetails({
    id,
    cityEnityId,
    editHash,
    trip,
  }: {
    id: number;
    cityEnityId: string;
    editHash: string;
    trip: string;
  }) {
    return await this.tripDetailsRepository.update(
      {
        id,
        editHash,
      },
      {
        cityEnityId,
        editHash,
        trip,
      },
    );
  }

  async getTripDetails({ id }: { id: number }) {
    return await this.tripDetailsRepository.findOne({ where: { id } });
  }

  async getAllTripDetails() {
    return await this.tripDetailsRepository.find();
  }

  async getCache({ searchHash }: { searchHash: string }) {
    return await this.flightCacheRepository.findOne({
      where: { searchHash },
    });
  }

  async createHash({
    from,
    to,
    depart,
    returnDate,
  }: {
    from: string;
    to: string;
    depart: string;
    returnDate?: string;
  }) {
    const saltOrRounds = 10;
    const hash = `${from}-${to}-${depart}${returnDate ? `-${returnDate}` : ''}`;
    //const hashCrypt = await bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  async createHistoryPrice({
    price,
    searchHash,
  }: {
    price?: number;
    searchHash: string;
  }) {
    return await this.flightHistoryPriceRepository.save({
      price,
      searchHash,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  async getHistoryPrice({ searchHash }: { searchHash: string }) {
    return await this.flightHistoryPriceRepository.findBy({
      searchHash,
    });
  }

  flightsLivePricesCreate(query: {
    from: string;
    to: string;
    depart: string;
    return: string;
  }): Promise<AxiosResponse<{ sessionToken: string; status: string }>> {
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
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
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
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  flightsIndicitiveSearch(query: {
    month?: number;
    year?: number;
    endMonth?: number;
    endYear?: number;
    from: string;
    to?: string;
    tripType?: string;
    groupType?: string;
  }): Promise<AxiosResponse<any>> {
    const isSingle = query.tripType === 'single';
    console.log('worked');

    const queryLegs: any[] = [
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
            month: query?.month || new Date().getMonth() + 1,
            year: query?.year || moment().year(),
          },
          endDate: {
            month: query?.endMonth || query?.month || new Date().getMonth() + 1,
            year: query?.endYear || query?.year || moment().year(),
          },
        },
      },
    ];
    if (!isSingle) {
      queryLegs.push({
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
            month: query?.month || new Date().getMonth() + 1,
            year: query?.year || moment().year(),
          },
          endDate: {
            month: query?.endMonth || query?.month || new Date().getMonth() + 1,
            year: query?.endYear || query?.year || moment().year(),
          },
        },
      });
    }

    console.log({
      startDate: {
        month: query?.month || new Date().getMonth() + 1,
        year: query?.year || moment().year(),
      },
      endDate: {
        month: query?.endMonth || query?.month || new Date().getMonth() + 1,
        year: query?.endYear || query?.year || moment().year(),
      },
    });

    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/indicative/search`,
      {
        query: {
          currency: 'GBP',
          locale: 'en-GB',
          market: 'UK',
          ...(query.groupType === 'month'
            ? { dateTimeGroupingType: 'DATE_TIME_GROUPING_TYPE_BY_MONTH' }
            : {}),
          ...(query.groupType === 'date'
            ? { dateTimeGroupingType: 'DATE_TIME_GROUPING_TYPE_BY_DATE' }
            : {}),
          queryLegs,
        },
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
        // validateStatus: function (status) {
        //   return status < 500; // Resolve only if the status code is less than 500
        // },
      },
    );
  }

  searchHotels(query: {
    entityId: string;
    from: string;
    to: string;
    depart: string;
    return: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `${this.SKYSCANNER_HOTEL_API_URL}/v3/prices/search/entity/${query.entityId}`,
      {
        params: {
          market: 'UK',
          locale: 'en-GB',
          checkin_date: query.depart,
          checkout_date: query.return,
          currency: 'GBP',
          adults: 1,
          rooms: 1,
          images: 3,
          image_resolution: 'high',
          boost_official_partners: 0,
          sort: '-price',
          limit: 30,
          offset: 0,
          partners_per_hotel: 3,
          enhanced:
            'filters,partners,images,location,amenities,extras,query_location',
        },
        headers: {
          'x-user-agent': 'M;B2B',
          apikey: this.SKYSCANNER_HOTEL_API_KEY,
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

  async geoNearest(query: {
    latitude: number;
    longitude: number;
  }): Promise<AxiosResponse<any>> {
    console.log('check Query', {
      query,
    });
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/geo/hierarchy/flights/nearest`,
      {
        locale: 'en-GB',
        locator: {
          coordinates: {
            latitude: query.latitude,
            longitude: query.longitude,
          },
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
