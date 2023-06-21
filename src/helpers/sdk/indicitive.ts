export interface SkyscannerAPIIndicitiveResponse {
  status: string;
  content: {
    results: IndicitiveResults;
    groupingOptions: {
      byRoute: {
        quotesGroups: IndicitiveQuote[];
      };
      byDate: {
        quotesOutboundGroups: IndicitiveQuote[];
        quotesInboundGroups: IndicitiveQuote[];
      };
    };
  };
}

export interface IndicitiveQuote {
  originPlaceId?: string;
  destinationPlaceId?: string;
  monthYearDate?: {
    year: string;
    month: string;
    day: string;
  };
  quoteIds: string[];
}

export interface IndicitiveLeg {
  originPlaceId: string;
  destinationPlaceId: string;
  departureDateTime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
  quoteCreationTimestamp: string;
  marketingCarrierId: string;
}

export interface IndicitiveResults {
  quotes: {
    [key: string]: {
      minPrice: {
        amount: string;
        unit: string;
        updateStatus: string;
      };
      isDirect: boolean;
      outboundLeg: IndicitiveLeg;
      inboundLeg: IndicitiveLeg;
    };
  };
  places: {
    [key: string]: {
      entityId: string;
      parentId: string;
      name: string;
      type: string;
      iata: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
  };
}
