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
}
