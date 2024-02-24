import { Controller, Get, Param, Query } from '@nestjs/common';
import { SeoPagesService } from '../seo-pages/seo-pages.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as contentful from 'contentful';

@Module({
  imports: [HttpModule],
  providers: [SeoPagesService],
})
@Controller()
export class SeoPagesController {
  CONTENTFUL_SPACE = '';
  CONTENTFUL_ENVIRONMENT = '';
  CONTENTFUL_ACCESS_TOKEN = '';
  UNSPLASH_ACCESS_KEY = '';

  constructor(
    private readonly seoPagesService: SeoPagesService,
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

  @Get('/seo-pages/pages')
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

    return entries.items[0].fields.components;
  }

  @Get('/seo-pages/pages/:slug')
  @ApiExcludeEndpoint()
  async getSeoPage(@Param() params: { slug: string }): Promise<any> {
    const client = contentful.createClient({
      space: this.CONTENTFUL_SPACE,
      environment: this.CONTENTFUL_ENVIRONMENT,
      accessToken: this.CONTENTFUL_ACCESS_TOKEN,
    });

    const entries = await client.getEntries({
      content_type: 'seoPage',
      limit: 1,
      include: 10,
      'fields.slug': params.slug,
    });
    const entry = entries?.items[0] || null;
    if (!entry) return null;

    return entry;
  }
}
