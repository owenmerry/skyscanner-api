import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { AppService } from '../../app.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchSDK } from '../../helpers/sdk/flight';
import type { IndicitiveQuote, SkyscannerAPIIndicitiveResponse } from '../../helpers/sdk/indicitive';
import { skyscanner } from '../../helpers/sdk/flight';
import { getPrice } from '../../helpers/sdk/price';
import { SearchDescription, ExploreDescription } from '../../helpers/dto/flight';
import { ChatGPTDescription } from '../../helpers/dto/chatgpt';
import {
  ApiResponse,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiParam,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful'


@Module({
  imports: [HttpModule],
  providers: [AppService],
})
@Controller()
export class ChatGPTController {
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


  // Chat GPT

  @Get('/search-simple/:from/:to/:depart/')
  @ApiResponse({
    status: 200,
    description: 'Endpoint for flight search can be used for searches with from, to and depart details',
    type: SearchDescription,
  })
  @ApiParam({ name: 'from', required: true, description: 'IATA location flight origin', schema: { type: 'string' } })
  @ApiParam({ name: 'to', required: true, description: 'IATA location flight destination', schema: { type: 'string' } })
  @ApiParam({ name: 'depart', required: true, description: 'Depature date of the flight in yyyy-mm-dd format', schema: { type: 'string' } })
  @ApiQuery({ name: 'return', required: false, description: 'Return date of the flight in yyyy-mm-dd format', schema: { type: 'string' } })
  async getSearchSimple(
    @Param() params: { from: string, to: string, depart: string, return?: string },
    @Query()
    queryString: {
      return: string;
    },
  ): Promise<any> {
    //setup variables
    const pollTimeout = 2000;
    const endpointTimeout = 5000;
    const maxPolls = 200;
    const maxFlights = 5;
    const start = Date.now();
    const getExcecutionTime = () => {
      return Date.now() - start;
    };
    const query = {
      from: params.from,
      to: params.to,
      depart: params.depart,
      return: queryString.return || '',
    };
    const buildUrl = () => {
      return `https://flights.owenmerry.com/search/${query.from}/${query.to}/${query.depart}/${query.return}`;
    }

    // run create
    const res = await this.appService.flightsLivePricesSearchChatGPT(query);
    let data = skyscanner(res.data).search();
    const dataSaved = skyscanner(res.data).search();
    const sessionToken = data.sessionToken;

    // setup poll function
    const pollFlights = (token: string) => new Promise<SearchSDK>(async (resolve) => {
      const resPoll = await this.appService.flightsLivePricesPollChatGPT(token, { timeout: pollTimeout });
      if (!resPoll) {
        console.log('came back with false');
        return resolve(dataSaved);
      }
      const pollData = skyscanner(resPoll.data).search();

      resolve({
        ...pollData,
        flights: pollData.flights.slice(0, maxFlights),
      });
    })

    const buildReturn = (data: SearchSDK) => {
      const flightData = {
        best: data.flightsBest[0],
        cheapest: data.flights[0],
        fastest: data.flightsFastest[0],
        poll: 'end',
        time: getExcecutionTime(),
        searchUrl: buildUrl(),
      };
      const addZero = (num: string) => (('0' + num).slice(-2));
      const isReturn = !!(flightData.best.legs[1]);


      return {
        search: `
        Here are some flight details from ${flightData.best.legs[0].from} to ${flightData.best.legs[0].to}
  
        #Best
          - ${flightData.best.legs[0].departure.split(' ')[1]} ${isReturn ? `return ${flightData.best.legs[1].departure.split(' ')[1]}` : ''}  for ${flightData.best.price}
        #Cheapest
          - ${flightData.cheapest.legs[0].departure.split(' ')[1]} ${isReturn ? `return ${flightData.cheapest.legs[1].departure.split(' ')[1]}` : ''} for ${flightData.cheapest.price}
        #Fastest
          - ${flightData.fastest.legs[0].departure.split(' ')[1]} ${isReturn ? `return ${flightData.fastest.legs[1].departure.split(' ')[1]}` : ''} for ${flightData.fastest.price}
        
        [See Flight Search](https://www.skyscanner.net/transport/flights/${flightData.best.legs[0].fromIata}/${flightData.best.legs[0].toIata}/23${addZero(flightData.best.legs[0].departure.split('/')[1])}${addZero(flightData.best.legs[0].departure.split('/')[0])}${isReturn ? `/23${addZero(flightData.best.legs[1].departure.split('/')[1])}${addZero(flightData.best.legs[1].departure.split('/')[0])}/` : ''})
        `,
      }
    }

    // run polls
    for (let pollCount = 1; pollCount < maxPolls + 1; pollCount++) {
      data = await pollFlights(sessionToken);
      console.log(`check poll ${pollCount} stats`, data.status);
      if (data.status === 'RESULT_STATUS_COMPLETE' || getExcecutionTime() > endpointTimeout) {
        console.log(`Poll finsihed on poll ${pollCount}`, data.status, getExcecutionTime());
        return {
          search: buildReturn(data),
        };
      }
      console.log(`poll ${pollCount}`, data.status);
    }

    // end search
    console.log(`Poll got to max polls`, data.status, getExcecutionTime());

    return {
      search: buildReturn(data),
    };


  }

  @Get('/chatgpt')
  @ApiExcludeEndpoint()
  async getChatGpt(): Promise<any> {
    const contentful = require('contentful');

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN
    })

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    })

    return entries.items[0].fields.response;
  }

  @Get('/chatgpt/open-api')
  @ApiExcludeEndpoint()
  async getChatGptOpenApi(): Promise<any> {

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN
    })

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    });

    return entries.items[0].fields.openApi;
  }

  @Get('/chatgpt/description')
  @ApiResponse({
    status: 200,
    description: 'Endpoint to search for flights prices from an origin where destination is not provided or to anywhere, great for when you just want to explore',
    type: ExploreDescription,
  })
  @ApiQuery({ name: 'from', required: true, description: 'Get location you want to fly from as a IATA code', schema: { type: 'string' } })
  async getPriceChatGpt(
    @Query()
    query: {
      from: string;
      month?: number;
      groupType?: string;
      to?: string;
    }, @Headers() headers: any
  ): Promise<any> {
    const res = await this.appService.flightsIndicitiveSearchChatGPT(query);
    const search = res.data;
    const sortByPrice = (quoteGroups: IndicitiveQuote[]) => {
      const sorted = quoteGroups.sort(function (a, b) {
        const quoteA: any = search?.content.results.quotes[a.quoteIds[0]];
        const quoteB: any = search?.content.results.quotes[b.quoteIds[0]];

        return quoteA.minPrice.amount - quoteB.minPrice.amount;
      });

      return sorted;
    }
    const addPlaces = (items: IndicitiveQuote[], search: SkyscannerAPIIndicitiveResponse) => {
      const itemsUpdated = items.map((item) => {
        const quotes = item.quoteIds.map((quoteId) => search.content.results.quotes[quoteId]);
        const price = getPrice(quotes[0].minPrice.amount, quotes[0].minPrice.unit);
        const checked = quotes[0].inboundLeg.quoteCreationTimestamp > quotes[0].outboundLeg.quoteCreationTimestamp ? quotes[0].inboundLeg.quoteCreationTimestamp : quotes[0].outboundLeg.quoteCreationTimestamp;
        const checkedDate = new Date(checked);
        return {
          ...item,
          originPlace: search.content.results.places[quotes[0].outboundLeg.originPlaceId],
          destinationPlace: search.content.results.places[quotes[0].outboundLeg.destinationPlaceId],
          destinationCountry: search.content.results.places[item.destinationPlaceId],
          quotes,
          price,
          checkedDate
        }
      })

      return itemsUpdated;
    };

    const sortedByPrice = addPlaces(sortByPrice(search.content.groupingOptions.byRoute.quotesGroups).filter((item) => search.content.results.places[item.destinationPlaceId].iata !== '' || 1 === 1), search);

    const allFlights = sortedByPrice.splice(0, 3).map((flight) => {
      return `
      - [${flight.destinationPlace.name}, ${flight.destinationCountry.name} (${flight.destinationPlace.iata}) for ${flight.price}](https://www.skyscanner.net/transport/flights/${flight.originPlace.iata}/${flight.destinationPlace.iata}/230${flight.quotes[0].inboundLeg.departureDateTime.month}${flight?.quotes[0]?.inboundLeg?.departureDateTime?.day}/230${flight?.quotes[0]?.inboundLeg?.departureDateTime?.month}${flight?.quotes[0]?.inboundLeg?.departureDateTime?.day}/)
      `;
    })

    return {
      deal: `
      Here are some flight deals from ${query.from}:
      ${allFlights}
      [See All Deals](https://www.skyscanner.net/transport/flights-from/${query.from}/)
      `,
      headers: headers,
    }
  }


}
