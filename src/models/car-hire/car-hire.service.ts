import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as moment from 'moment';

@Injectable()
export class CarHireService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_CAR_HIRE_API_URL = '';
  SKYSCANNER_API_KEY = '';

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.SKYSCANNER_API_URL =
      this.configService.get<string>('SKYSCANNER_API_URL') || '';
    this.SKYSCANNER_CAR_HIRE_API_URL =
      this.configService.get<string>('SKYSCANNER_CAR_HIRE_API_URL') || '';
    this.SKYSCANNER_API_KEY =
      this.configService.get<string>('SKYSCANNER_API_KEY') || '';
  }

  carHireSearchCreate(query: {
    from: string;
    to: string;
    depart: string;
    return: string;
  }): Promise<AxiosResponse<{ sessionToken: string }>> {
    const hasReturn = !!query.return;
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_CAR_HIRE_API_URL}/flights/live/search/create`,
      {
        query: {},
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

  carHireSearchPoll(sessionToken: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_CAR_HIRE_API_URL}/flights/live/search/poll/${sessionToken}`,
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

  carHireIndicitiveSearch({
    query,
  }: {
    query: {
      from: string;
      depart?: string;
      return?: string;
      groupType?: string;
    };
  }): Promise<AxiosResponse<any>> {
    const departDefault = moment().add(1, 'days').format('YYYY-MM-DD');
    const returnDefault = moment(query.return || query.depart)
      .endOf('month')
      .format('YYYY-MM-DD');
    const groupTypeDefault = 'DATE_TIME_GROUPING_TYPE_BY_MONTH';
    const departMoment = moment(query.depart || departDefault);
    const returnMoment = moment(query.return || returnDefault);

    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_CAR_HIRE_API_URL}/carhire/indicative/search`,
      {
        query: {
          market: 'UK',
          locale: 'en-GB',
          currency: 'GBP',
          pickUpDate: {
            day: departMoment.format('D'),
            month: departMoment.format('M'),
            year: departMoment.format('YYYY'),
          },
          dropOffDate: {
            day: returnMoment.format('D'),
            month: returnMoment.format('M'),
            year: returnMoment.format('YYYY'),
          },
          dateTimeGroupingType: query.groupType || groupTypeDefault,
          pickUpDropOffLocationEntityId: query.from,
        },
      },
      {
        headers: {
          'x-api-key': this.SKYSCANNER_API_KEY,
        },
      },
    );
  }

  autoSuggest(search: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `${this.SKYSCANNER_API_URL}/autosuggest/carhire`,
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
