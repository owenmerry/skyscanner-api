import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful';
import { sql } from '../../db/neon';

@Module({
  imports: [HttpModule],
  providers: [ContentService],
})
@Controller()
export class ContentController {
  CONTENTFUL_SPACE = '';
  CONTENTFUL_ENVIRONMENT = '';
  CONTENTFUL_ACCESS_TOKEN = '';
  UNSPLASH_ACCESS_KEY = '';
  NEON_DB_CONNECTION = '';

  constructor(
    private readonly contentService: ContentService,
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
    this.NEON_DB_CONNECTION =
      this.configService.get<string>('NEON_DB_CONNECTION') || '';
  }

  @Get('/content/pages')
  @ApiExcludeEndpoint()
  async getSeoPages(): Promise<any> {
    const contentful = require('contentful');

    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN,
    });

    const entries = await client.getEntries({
      content_type: 'seoPage',
    });
    const neondb = sql(this.NEON_DB_CONNECTION);
    const response = await neondb(`SELECT version()`);
    console.log(response);

    return response;

    return entries.items[0].fields.components;
  }

  @Get('/content/pages/:slug')
  @ApiExcludeEndpoint()
  async getSeoPage(@Param() params: { slug: string }): Promise<any> {
    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN,
    });

    const entries = await client.getEntries({
      content_type: 'seoPage',
    });

    const entry = entries?.items[0] || null;
    if (!entry) return null;

    const entriesOrdered = this.contentService.orderEntries(entries);
    const entriesFiltered = this.contentService.filterEntries(
      entriesOrdered,
      params.slug,
    );

    const entryFound = entriesFiltered?.items[0] || null;
    if (!entryFound) return null;

    return entryFound;
  }
}
