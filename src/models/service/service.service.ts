import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as moment from 'moment';

@Injectable()
export class ServiceService {
  KIWI_API_KEY = '';
  GOOGLE_API_KEY_LOCATION = '';
  TRIPADVISOR_API_KEY = '';

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.KIWI_API_KEY = this.configService.get<string>('KIWI_API_KEY') || '';
    this.GOOGLE_API_KEY_LOCATION =
      this.configService.get<string>('GOOGLE_API_KEY_LOCATION') || '';
    this.TRIPADVISOR_API_KEY =
      this.configService.get<string>('TRIPADVISOR_API_KEY') || '';
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

  getGoogleRoutes(query: {
    originAddress?: string;
    destinationAddress?: string;
    originId?: string;
    destinationId?: string;
    travelMode: string;
    arrivalTime: string;
  }): Promise<AxiosResponse<any>> {

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
          'X-Goog-Api-Key': this.GOOGLE_API_KEY_LOCATION,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );

    console.log({
      origin: query.originId
        ? { placeId: query.originId }
        : {
            address: query.originAddress,
          },
      destination: query.destinationId
        ? { placeId: query.destinationId }
        : {
            address: query.destinationAddress,
          },
      travelMode: query.travelMode,
      arrivalTime: query.arrivalTime,
      computeAlternativeRoutes: true,
    });

    return this.httpService.axiosRef.post(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        origin: query.originId
          ? { placeId: query.originId }
          : {
              address: query.originAddress,
            },
        destination: query.originId
          ? { placeId: query.originId }
          : {
              address: query.originAddress,
            },
        travelMode: query.travelMode,
        arrivalTime: query.arrivalTime,
        computeAlternativeRoutes: true,
      },
      {
        headers: {
          accept: 'application/json',
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.legs.stepsOverview,routes.legs.localizedValues',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY_LOCATION,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getGoogleAutocomplete(query: {
    search: string;
    latitude: number;
    longitude: number;
    radius: number;
  }): Promise<AxiosResponse<any>> {
    const locationBias =
      query.latitude && query.longitude && query.radius
        ? {
            circle: {
              center: {
                latitude: query.latitude,
                longitude: query.longitude,
              },
              radius: query.radius,
            },
          }
        : undefined;
    return this.httpService.axiosRef.post(
      `https://places.googleapis.com/v1/places:autocomplete`,
      {
        input: query.search,
        locationBias,
      },
      {
        headers: {
          accept: 'application/json',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY_LOCATION,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getGooglePlacesDetails(placeId: string): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          accept: 'application/json',
          'X-Goog-FieldMask': '*',
          'X-Goog-Api-Key': this.GOOGLE_API_KEY_LOCATION,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getTripAdvisorLocations(query: {
    searchQuery: string;
    latLong: string;
  }): Promise<AxiosResponse<any>> {
    console.log(
      `https://api.content.tripadvisor.com/api/v1/location/search?key=${this.TRIPADVISOR_API_KEY}&searchQuery=${query.searchQuery}&category=attractions&language=en&latLong=${query.latLong}`,
    );
    return this.httpService.axiosRef.get(
      `https://api.content.tripadvisor.com/api/v1/location/search?key=${this.TRIPADVISOR_API_KEY}&searchQuery=${query.searchQuery}&category=attractions&language=en&latLong=${query.latLong}`,
      {
        headers: {
          origin: 'https://api.flights.owenmerry.com',
          referer: 'https://api.flights.owenmerry.com',
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getTripAdvisorImages(query: {
    location_id: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://api.content.tripadvisor.com/api/v1/location/${query.location_id}/photos?language=en&key=${this.TRIPADVISOR_API_KEY}`,
      {
        headers: {
          origin: 'https://api.flights.owenmerry.com',
          referer: 'https://api.flights.owenmerry.com',
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }

  getTripAdvisorDetails(query: {
    location_id: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://api.content.tripadvisor.com/api/v1/location/${query.location_id}/details?language=en&currency=USD&key=${this.TRIPADVISOR_API_KEY}`,
      {
        headers: {
          origin: 'https://api.flights.owenmerry.com',
          referer: 'https://api.flights.owenmerry.com',
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }
  getWeatherForecast(query: {
    latitude: string;
    longitude: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${query.latitude}&longitude=${query.longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
      {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }
  getWeatherPastDays(query: {
    latitude: string;
    longitude: string;
    days: number;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${query.latitude}&longitude=${query.longitude}&past_days=${query.days}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
      {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }
  getWeatherHistory(query: {
    latitude: string;
    longitude: string;
    start_date: string;
    end_date: string;
  }): Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(
      `https://archive-api.open-meteo.com/v1/era5?latitude=${query.latitude}&longitude=${query.longitude}&start_date=${query.start_date}&end_date=${query.end_date}&hourly=temperature_2m`,
      {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      },
    );
  }
}
