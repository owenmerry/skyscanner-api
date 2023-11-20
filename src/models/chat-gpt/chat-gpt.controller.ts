import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatGptService } from '../../models/chat-gpt/chat-gpt.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchDescription } from '../../helpers/dto/flight';
import {
  ApiResponse,
  ApiQuery,
  ApiExcludeEndpoint,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful';

@Module({
  imports: [HttpModule],
  providers: [ChatGptService],
})
@Controller()
export class ChatGPTController {
  CONTENTFUL_SPACE = '';
  CONTENTFUL_ENVIRONMENT = '';
  CONTENTFUL_ACCESS_TOKEN = '';
  UNSPLASH_ACCESS_KEY = '';

  constructor(
    private readonly chatGptService: ChatGptService,
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

  // Chat GPT
  @Get('/chatgpt/search/:from/')
  @ApiOperation({
    summary: 'Flight Search API to get flight details and prices',
  })
  @ApiResponse({
    status: 200,
    description:
      'Endpoint for flight search which will return deals, flight details and pricing. give all the flight info or some and explore your options to anywhere',
    type: SearchDescription,
  })
  @ApiParam({
    name: 'from',
    required: true,
    description: 'IATA location for flight origin',
    schema: { type: 'string' },
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Optional IATA location for flight destination',
    schema: { type: 'string' },
  })
  @ApiQuery({
    name: 'depart',
    required: false,
    description: 'Optional Depature date of the flight in yyyy-mm-dd format',
    schema: { type: 'string' },
  })
  @ApiQuery({
    name: 'return',
    required: false,
    description: 'Optional Return date of the flight in yyyy-mm-dd format',
    schema: { type: 'string' },
  })
  async getSearchSimple(
    @Param() params: { from: string },
    @Query()
    queryString: {
      to?: string;
      depart?: string;
      return?: string;
    },
  ): Promise<any> {
    if (!queryString.to || !queryString.depart) {
      // explore search
      const exploreSearchDescription =
        await this.chatGptService.getChatGPTDescriptionExplore({
          from: params.from,
          to: queryString.to,
          month: new Date().getMonth() + 2,
        });

      return {
        search: exploreSearchDescription,
      };
    }

    // live search
    const liveSearchDescription =
      await this.chatGptService.getChatGPTDescriptionLive({
        from: params.from,
        to: queryString.to,
        depart: queryString.depart,
        return: queryString.return,
      });

    return {
      search: liveSearchDescription,
    };
  }

  @Get('/chatgpt/contentful/response')
  @ApiExcludeEndpoint()
  async getChatGpt(): Promise<any> {
    const contentful = require('contentful');

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN,
    });

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    });

    return entries.items[0].fields.response;
  }

  @Get('/chatgpt/contentful/open-api')
  @ApiExcludeEndpoint()
  async getChatGptOpenApi(): Promise<any> {
    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN,
    });

    const entries = await client.getEntries({
      content_type: 'endpoint',
      limit: 1,
    });

    return entries.items[0].fields.openApi;
  }
}
