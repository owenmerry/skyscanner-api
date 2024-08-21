import { Controller, Get, Param, Query } from '@nestjs/common';
import { CarHireService } from './car-hire.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [CarHireService],
})
@Controller()
export class CarHireController {
  constructor(
    private readonly carHireService: CarHireService,
    private configService: ConfigService,
  ) {}

  @Get('car-hire/create')
  @ApiExcludeEndpoint()
  async getCreate(
    @Query()
    query: {
      from: string;
      to: string;
      depart: string;
      return: string;
    },
  ): Promise<any> {
    // const searchHash = await this.flightService.createHash({
    //   ...query,
    //   returnDate: query.return,
    // });
    // const cache = await this.flightService.getCache({ searchHash });
    // if (cache) {
    //   const res = await this.flightService.flightsLivePricesPoll(
    //     cache.sessionToken,
    //   );

    //   return res.data;
    // }

    // const res = await this.flightService.flightsLivePricesCreate(query);
    // const save = await this.flightService.createCache({
    //   sessionToken: res.data.sessionToken,
    //   searchHash,
    // });

    return 'car search';
  }

  @Get('car-hire/poll/:token')
  @ApiExcludeEndpoint()
  async getPoll(@Param() params: { token: string }): Promise<any> {
    // const res = await this.flightService.flightsLivePricesPoll(params.token);

    return 'car search poll';
  }

  @Get('car-hire/price')
  @ApiExcludeEndpoint()
  async getPrice(
    @Query()
    query: {
      from: string;
      depart?: string;
      return?: string;
      groupType?: string;
    },
  ): Promise<any> {
    const res = await this.carHireService.carHireIndicitiveSearch({ query });

    console.log(res.data);

    return res.data;
  }
}
