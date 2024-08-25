import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Module({
  imports: [HttpModule],
  providers: [ServiceService],
})
@Controller()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('service/kiwi/search')
  @ApiExcludeEndpoint()
  async getKiwiSearch(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return?: string;
    },
  ): Promise<any> {
    const res = await this.serviceService.getKiwiSearch(query);

    return res.data;
  }

  @Get('service/google/routes')
  @ApiExcludeEndpoint()
  async getGoogleRoutes(): Promise<any> {
    const res = await this.serviceService.getGoogleRoutes();

    return res.data;
  }

  @Get('service/tripadvisor/locations')
  @ApiExcludeEndpoint()
  async getTripAdvisorLocations(
    @Query()
    query: {
      searchQuery: string;
      latLong: string;
    },
  ): Promise<any> {
    const res = await this.serviceService.getTripAdvisorLocations(query);

    return res.data;
  }

  @Get('service/tripadvisor/images')
  @ApiExcludeEndpoint()
  async getTripAdvisorImages(
    @Query()
    query: {
      location_id: string;
    },
  ): Promise<any> {
    const res = await this.serviceService.getTripAdvisorImages(query);

    return res.data;
  }

  @Get('service/tripadvisor/details')
  @ApiExcludeEndpoint()
  async getTripAdvisorDetails(
    @Query()
    query: {
      location_id: string;
    },
  ): Promise<any> {
    const res = await this.serviceService.getTripAdvisorDetails(query);

    return res.data;
  }

  @Get('service/weather/forcast')
  @ApiExcludeEndpoint()
  async getWeatherForecast(
    @Query()
    query: {
      latitude: string;
      longitude: string;
    },
  ): Promise<any> {
    const res = await this.serviceService.getWeatherForecast(query);

    return res.data;
  }

  @Get('service/weather/past')
  @ApiExcludeEndpoint()
  async getWeatherPastDays(
    @Query()
    query: {
      latitude: string;
      longitude: string;
      days: number;
    },
  ): Promise<any> {
    const res = await this.serviceService.getWeatherPastDays(query);

    return res.data;
  }

  @Get('service/weather/history')
  @ApiExcludeEndpoint()
  async getWeatherHistory(
    @Query()
    query: {
      latitude: string;
      longitude: string;
      start_date: number;
      end_date: number;
    },
  ): Promise<any> {
    const res = await this.serviceService.getWeatherHistory(query);

    return res.data;
  }
}
