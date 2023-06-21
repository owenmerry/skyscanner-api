import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import type {
  IndicitiveQuote,
  SkyscannerAPIIndicitiveResponse,
} from '../../helpers/sdk/indicitive';
import { skyscanner } from '../../helpers/sdk/flight';
import { SearchSDK } from '../../helpers/sdk/flight';
import { getPrice } from '../../helpers/sdk/price';

@Injectable()
export class ChatGptService {
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

  flightsLivePricesSearchChatGPT(query: {
    from: string;
    to: string;
    depart: string;
    return?: string;
  }): Promise<AxiosResponse<any>> {
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
                iata: query.from,
              },
              destinationPlaceId: {
                iata: query.to,
              },
              date: {
                year: Number(query.depart.split('-')[0]),
                month: Number(query.depart.split('-')[1]),
                day: Number(query.depart.split('-')[2]),
              },
            },
          ],
          ...(!!query.return && {
            queryLegs: [
              {
                originPlaceId: {
                  iata: query.from,
                },
                destinationPlaceId: {
                  iata: query.to,
                },
                date: {
                  year: Number(query.depart.split('-')[0]),
                  month: Number(query.depart.split('-')[1]),
                  day: Number(query.depart.split('-')[2]),
                },
              },
              {
                originPlaceId: {
                  iata: query.to,
                },
                destinationPlaceId: {
                  iata: query.from,
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

  flightsLivePricesPollChatGPT(
    sessionToken: string,
    { timeout = 5000 }: { timeout: number },
  ): Promise<AxiosResponse<any> | false> {
    try {
      return this.httpService.axiosRef
        .post(
          `${this.SKYSCANNER_API_URL}/flights/live/search/poll/${sessionToken}`,
          {},
          {
            headers: {
              'x-api-key': this.SKYSCANNER_API_KEY,
            },
            validateStatus: function (status) {
              return status < 500; // Resolve only if the status code is less than 500
            },
            timeout,
          },
        )
        .catch(() => {
          return false;
        });
    } catch (err) {
      return new Promise((resolve) => resolve(false));
    }
  }

  flightsIndicitiveSearchChatGPT(query: {
    month?: number;
    endMonth?: number;
    from: string;
    to?: string;
    groupType?: string;
  }): Promise<AxiosResponse<SkyscannerAPIIndicitiveResponse>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/flights/indicative/search`,
      {
        query: {
          currency: 'GBP',
          locale: 'en-GB',
          market: 'UK',
          queryLegs: [
            {
              originPlace: {
                queryPlace: {
                  iata: query.from,
                },
              },
              destinationPlace: {
                ...(query?.to && query.to !== 'anywhere'
                  ? {
                      queryPlace: {
                        iata: query.to,
                      },
                    }
                  : { anywhere: true }),
              },
              dateRange: {
                startDate: {
                  year: 2023,
                  month: query?.month || new Date().getMonth() + 1,
                },
                endDate: {
                  year: 2023,
                  month: query?.month || new Date().getMonth() + 1,
                },
              },
            },
            {
              originPlace: {
                ...(query?.to && query.to !== 'anywhere'
                  ? {
                      queryPlace: {
                        iata: query.to,
                      },
                    }
                  : { anywhere: true }),
              },
              destinationPlace: {
                queryPlace: {
                  iata: query.from,
                },
              },
              dateRange: {
                startDate: {
                  year: 2023,
                  month: query?.month || new Date().getMonth() + 1,
                },
                endDate: {
                  year: 2023,
                  month: query?.month || new Date().getMonth() + 1,
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
    );
  }

  async getChatGPTDescriptionLive(query: {
    from: string;
    to: string;
    depart: string;
    return?: string;
  }): Promise<string> {
    //setup variables
    const pollTimeout = 2000;
    const endpointTimeout = 5000;
    const maxPolls = 200;
    const maxFlights = 5;

    const start = Date.now();
    const getExcecutionTime = () => {
      return Date.now() - start;
    };
    const buildUrl = () => {
      return `https://flights.owenmerry.com/search/${query.from}/${query.to}/${query.depart}/${query.return}`;
    };

    // run create
    const res = await this.flightsLivePricesSearchChatGPT(query);
    let data = skyscanner(res.data).search();
    const dataSaved = skyscanner(res.data).search();
    const sessionToken = data.sessionToken;

    // setup poll function
    const pollFlights = (token: string) =>
      new Promise<SearchSDK>(async (resolve) => {
        const resPoll = await this.flightsLivePricesPollChatGPT(token, {
          timeout: pollTimeout,
        });
        if (!resPoll) {
          console.log('came back with false');
          return resolve(dataSaved);
        }
        const pollData = skyscanner(resPoll.data).search();

        resolve({
          ...pollData,
          flights: pollData.flights.slice(0, maxFlights),
        });
      });

    const buildReturn = (data: SearchSDK) => {
      const flightData = {
        best: data.flightsBest[0],
        cheapest: data.flights[0],
        fastest: data.flightsFastest[0],
        poll: 'end',
        time: getExcecutionTime(),
        searchUrl: buildUrl(),
      };
      const addZero = (num: string) => ('0' + num).slice(-2);
      const isReturn = !!flightData.best.legs[1];

      return `
        Here are some flight details from ${flightData.best.legs[0].from} to ${
        flightData.best.legs[0].to
      }
  
        #Best
          - ${flightData.best.legs[0].departure.split(' ')[1]} ${
        isReturn
          ? `return ${flightData.best.legs[1].departure.split(' ')[1]}`
          : ''
      }  for ${flightData.best.price}
        #Cheapest
          - ${flightData.cheapest.legs[0].departure.split(' ')[1]} ${
        isReturn
          ? `return ${flightData.cheapest.legs[1].departure.split(' ')[1]}`
          : ''
      } for ${flightData.cheapest.price}
        #Fastest
          - ${flightData.fastest.legs[0].departure.split(' ')[1]} ${
        isReturn
          ? `return ${flightData.fastest.legs[1].departure.split(' ')[1]}`
          : ''
      } for ${flightData.fastest.price}
        
        [See Flight Search](https://www.skyscanner.net/transport/flights/${
          flightData.best.legs[0].fromIata
        }/${flightData.best.legs[0].toIata}/23${addZero(
        flightData.best.legs[0].departure.split('/')[1],
      )}${addZero(flightData.best.legs[0].departure.split('/')[0])}${
        isReturn
          ? `/23${addZero(
              flightData.best.legs[1].departure.split('/')[1],
            )}${addZero(flightData.best.legs[1].departure.split('/')[0])}/`
          : ''
      })
        `;
    };

    // run polls
    for (let pollCount = 1; pollCount < maxPolls + 1; pollCount++) {
      data = await pollFlights(sessionToken);
      console.log(`check poll ${pollCount} stats`, data.status);
      if (
        data.status === 'RESULT_STATUS_COMPLETE' ||
        getExcecutionTime() > endpointTimeout
      ) {
        console.log(
          `Poll finsihed on poll ${pollCount}`,
          data.status,
          getExcecutionTime(),
        );
        return buildReturn(data);
      }
      console.log(`poll ${pollCount}`, data.status);
    }

    // end search
    console.log(`Poll got to max polls`, data.status, getExcecutionTime());

    return buildReturn(data);
  }

  async getChatGPTDescriptionExplore(query: {
    from: string;
    to?: string;
    month?: number;
  }): Promise<string> {
    const res = await this.flightsIndicitiveSearchChatGPT(query);
    const search = res.data;
    const sortByPrice = (quoteGroups: IndicitiveQuote[]) => {
      const sorted = quoteGroups.sort(function (a, b) {
        const quoteA: any = search?.content.results.quotes[a.quoteIds[0]];
        const quoteB: any = search?.content.results.quotes[b.quoteIds[0]];

        return quoteA.minPrice.amount - quoteB.minPrice.amount;
      });

      return sorted;
    };
    const addPlaces = (
      items: IndicitiveQuote[],
      search: SkyscannerAPIIndicitiveResponse,
    ) => {
      const itemsUpdated = items.map((item) => {
        const quotes = item.quoteIds.map(
          (quoteId) => search.content.results.quotes[quoteId],
        );
        const price = getPrice(
          quotes[0].minPrice.amount,
          quotes[0].minPrice.unit,
        );
        const checked =
          quotes[0].inboundLeg.quoteCreationTimestamp >
          quotes[0].outboundLeg.quoteCreationTimestamp
            ? quotes[0].inboundLeg.quoteCreationTimestamp
            : quotes[0].outboundLeg.quoteCreationTimestamp;
        const checkedDate = new Date(checked);
        return {
          ...item,
          originPlace:
            search.content.results.places[quotes[0].outboundLeg.originPlaceId],
          destinationPlace:
            search.content.results.places[
              quotes[0].outboundLeg.destinationPlaceId
            ],
          destinationCountry:
            search.content.results.places[
              search.content.results.places[
                quotes[0].outboundLeg.destinationPlaceId
              ].parentId
            ],
          date: item.monthYearDate?.day
            ? `${item.monthYearDate.day}/${item.monthYearDate.month}/${item.monthYearDate.year}`
            : '',
          quotes,
          price,
          checkedDate,
        };
      });

      return itemsUpdated;
    };

    const quoteGroup = query.to
      ? search.content.groupingOptions.byDate.quotesOutboundGroups
      : search.content.groupingOptions.byRoute.quotesGroups;
    console.log(search.content.groupingOptions.byDate.quotesOutboundGroups);
    const sortedByPrice = addPlaces(sortByPrice(quoteGroup), search);

    const allFlights = sortedByPrice.splice(0, 10).map((flight) => {
      return `
      - [${flight.destinationPlace.name}, ${flight.destinationCountry.name} (${
        flight.destinationPlace.iata
      }) for ${flight.price} ${
        !!query.to ? flight.date : ''
      }](https://www.skyscanner.net/transport/flights/${
        flight.originPlace.iata
      }/${flight.destinationPlace.iata}/230${
        flight.quotes[0].outboundLeg.departureDateTime.month
      }${flight?.quotes[0]?.outboundLeg?.departureDateTime?.day}/230${
        flight?.quotes[0]?.inboundLeg?.departureDateTime?.month
      }${flight?.quotes[0]?.inboundLeg?.departureDateTime?.day}/)
      `;
    });

    return `
      Here are some flight deals from ${query.from}:
      ${allFlights}
      [See All Deals](https://www.skyscanner.net/transport/flights-from/${query.from}/)
      `;
  }
}
