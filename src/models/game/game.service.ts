import { Injectable, Module } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderBoard } from './game.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { FlightService } from '../flight/flight.service';
import { getPriceRaw } from '../../helpers/sdk/price';

@Injectable()
export class GameService {
  SKYSCANNER_API_URL = '';
  SKYSCANNER_API_KEY = '';
  SKYSCANNER_HOTEL_API_URL = '';
  SKYSCANNER_HOTEL_API_KEY = '';

  constructor(
    @InjectRepository(LeaderBoard)
    private leaderBoard: Repository<LeaderBoard>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private flightService: FlightService,
  ) {
    this.SKYSCANNER_API_URL =
      this.configService.get<string>('SKYSCANNER_API_URL') || '';
    this.SKYSCANNER_API_KEY =
      this.configService.get<string>('SKYSCANNER_API_KEY') || '';
    this.SKYSCANNER_HOTEL_API_URL =
      this.configService.get<string>('SKYSCANNER_HOTEL_API_URL') || '';
    this.SKYSCANNER_HOTEL_API_KEY =
      this.configService.get<string>('SKYSCANNER_HOTEL_API_KEY') || '';
  }

  async createNewScore({
    award,
    name,
    amount,
    stops,
  }: {
    award: 'price-left' | 'stops' | 'round-the-world';
    name: string;
    amount: number;
    stops: string;
  }) {
    return await this.leaderBoard.save({
      award,
      name,
      amount,
      stops,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  async getTopPriceScores() {
    const all = await this.leaderBoard.findBy({ award: 'price-left' });
    return all.sort((a, b) => b.amount - a.amount).slice(0, 10);
  }
  async getClosePriceScores() {
    const all = await this.leaderBoard.findBy({ award: 'price-left' });
    return all.sort((a, b) => a.amount - b.amount).slice(0, 10);
  }
  async getAward(
    stops: string[],
  ): Promise<
    | { award: 'price-left' | 'stops' | 'round-the-world'; amount: number }
    | undefined
  > {
    async function getPriceForStop(
      stop: string,
      stopPrev: string,
      stopNext: string,
      flightService: FlightService,
      searchDateString: string,
    ): Promise<{ price: number; date: string }> {
      if (!stopNext) return { price: 0, date: moment().format('YYYY-MM-DD') };
      // const response = await fetch(
      //   `https://api.example.com/stops/${stop}/price`,
      // );
      // const data = await response.json();
      // Simulate a fetch call to get the price for each stop
      //return data.price; // Assuming the price is returned in the 'price' field
      console.log('date', searchDateString);
      const searchDate = moment(searchDateString);
      const priceRes = await flightService.flightsIndicitiveSearch({
        from: stop,
        to: 'anywhere',
        tripType: 'single',
        groupType: 'month',
        month: Number(searchDate.format('MM')),
        year: Number(searchDate.format('YYYY')),
        endMonth: Number(searchDate.add(3, 'months').format('MM')),
        endYear: Number(searchDate.add(3, 'months').format('YYYY')),
      });
      console.log('origin', stopPrev ? stopPrev : stop);
      console.log('destination', !stopPrev ? 'anywhere' : stop);
      console.log('selected', stopNext);
      let searching = true;
      let priceFound = 0;
      let dateFound = moment().format('YYYY-MM-DD');

      const sortedFlights = Object.keys(
        priceRes.data.content.results.quotes,
      ).sort((a, b) => {
        const itemA = priceRes.data.content.results.quotes[a];
        const itemB = priceRes.data.content.results.quotes[b];
        return (
          parseFloat(itemA?.minprice?.amount) -
          parseFloat(itemB?.minprice?.amount)
        );
      });

      sortedFlights.forEach((item: any) => {
        const itemQuote = priceRes.data.content.results.quotes[item];
        if (itemQuote.outboundLeg.destinationPlaceId === stopNext) {
          const formatNumber = (str: string) => str.padStart(2, '0');
          const quote = itemQuote;
          const quotePrice = quote.minPrice.amount;
          const quotePriceUnit = quote.minPrice.unit;
          const quoteDate = `${
            quote.outboundLeg.departureDateTime.year
          }-${formatNumber(
            String(quote.outboundLeg.departureDateTime.month),
          )}-${formatNumber(String(quote.outboundLeg.departureDateTime.day))}`;
          const priceFoundLoop = quotePrice;
          if (priceFoundLoop < priceFound || searching) {
            priceFound = getPriceRaw(priceFoundLoop, quotePriceUnit) || 0;
            dateFound = quoteDate;
            console.log('found selected price', quotePrice);
            searching = false;
          }
        }
      });

      console.log('got for search', priceFound, dateFound);

      return {
        price: priceFound,
        date: dateFound,
      };
    }

    async function calculateTotalPrice(
      stops: string[],
      flightService: FlightService,
    ): Promise<{ total?: number; left?: number; save: boolean }> {
      // Use Promise.all to fetch all prices concurrently
      const prices = [];
      let currentDate = moment().format('YYYY-MM-DD');
      for (let index = 0; index < stops.length; index++) {
        const stopItem = stops[index];
        if (index !== stops.length - 1) {
          const price = await getPriceForStop(
            stopItem,
            stops[index - 1],
            stops[index + 1],
            flightService,
            currentDate,
          );
          console.log('check if save', price, index, stops.length);
          if (price.price === 0) return { save: false };
          prices.push(price.price);
          currentDate = price.date;
        }
      }

      // Sum up all the prices
      const totalPrice = prices.reduce(
        (total, price) => Number(total) + Number(price),
        0,
      );
      return { left: 1000 - totalPrice, total: totalPrice, save: true };
    }
    const checkFirstAndLastStrings = (
      arr: string[],
      targets: string[],
    ): boolean => {
      if (arr.length === 0) return false;

      const firstString = arr[0];
      const lastString = arr[arr.length - 1];

      return targets.includes(firstString) && targets.includes(lastString);
    };
    if (
      !checkFirstAndLastStrings(stops, [
        '27544008',
        '95565051',
        '95565053',
        '95565052',
        '95565050',
        '95565054',
      ])
    ) {
      return undefined;
    }
    const totalPrice = await calculateTotalPrice(stops, this.flightService);
    if (!totalPrice.left || !totalPrice.save) {
      console.log('exited here checking save', totalPrice);
      return undefined;
    }

    if (totalPrice.left > 0 && totalPrice.left < 1000 && stops.length > 3) {
      return {
        award: 'price-left',
        amount: totalPrice.left,
      };
    }

    console.log('exited here bottom');

    return undefined;
  }
}
