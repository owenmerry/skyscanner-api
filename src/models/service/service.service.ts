import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as moment from 'moment';

@Injectable()
export class ServiceService {
  KIWI_API_KEY = '';
  GOOGLE_API_KEY_ROUTES = '';

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.KIWI_API_KEY = this.configService.get<string>('KIWI_API_KEY') || '';
    this.GOOGLE_API_KEY_ROUTES =
      this.configService.get<string>('GOOGLE_API_KEY_ROUTES') || '';
  }

  getDateYYYYMMDDToDisplay = (dateTime?: string, display?: string) => {
    if (!dateTime) return '';
    return moment(dateTime).format(display || 'MMM Do');
  };

  getKiwiSearch(query: {
    from: string;
    to: string;
    depart: string;
    return?: string;
  }): Promise<AxiosResponse<any>> {
    // Function to search flights using Kiwi
    const hasReturn = query.return;

    return this.httpService.axiosRef.get(
      `https://api.tequila.kiwi.com/v2/search?fly_from=${
        query.from
      }&fly_to=${encodeURIComponent(query.to)}&date_from=${encodeURIComponent(
        this.getDateYYYYMMDDToDisplay(query.depart, 'DD/MM/YYYY'),
      )}&date_to=${encodeURIComponent(
        this.getDateYYYYMMDDToDisplay(query.depart, 'DD/MM/YYYY'),
      )}${
        hasReturn
          ? `&return_from=${encodeURIComponent(
              this.getDateYYYYMMDDToDisplay(query.return, 'DD/MM/YYYY'),
            )}&&return_to=${encodeURIComponent(
              this.getDateYYYYMMDDToDisplay(query.return, 'DD/MM/YYYY'),
            )}`
          : ''
      }&curr=GBP`,
      {
        headers: {
          accept: 'application/json',
          apikey: this.KIWI_API_KEY,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getGoogleRoutes(query: {}): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        origin: {
          address: '193 dover road, folkestone, ct196ng',
        },
        destination: {
          address: '19 porters way, west drayton, ub79aa',
        },
        travelMode: 'TRANSIT',
        arrivalTime: '2024-08-03T15:13:23Z',
        computeAlternativeRoutes: true,
      },
      {
        headers: {
          accept: 'application/json',
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.legs.stepsOverview,routes.legs.localizedValues',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY_ROUTES,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }
}
