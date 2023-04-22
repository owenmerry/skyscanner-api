import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiQuery,
    ApiExcludeEndpoint,
    ApiParam,
    ApiProperty,
} from '@nestjs/swagger';


class Segment {
    @ApiProperty({ description: 'Segment Id used by skyscanner for this segment' })
    id: string;

    @ApiProperty({ description: 'Location from for this flight' })
    from: string;

    @ApiProperty({ description: 'Location to for this segment' })
    to: string;

    @ApiProperty({ description: 'Duration of this segment of the flight booking' })
    duration: number;

    @ApiProperty({ description: 'Departure of this segment date and time' })
    departure: string;

    @ApiProperty({ description: 'Arrival of this segment date and time' })
    arrival: string;
}

class Stats {
    @ApiProperty({ description: 'Number of results found for this search, not all results may show' })
    total: number;

    @ApiProperty({ description: 'Cheapest price found for this flight search' })
    minPrice: string;
}

class DeepLink {

    @ApiProperty({ description: 'Url straight to the booking page of this deal so the price can be retrieved and booked' })
    link: string;

    @ApiProperty({ description: 'Type of agent or airline' })
    type:
        | 'AGENT_TYPE_UNSPECIFIED'
        | 'AGENT_TYPE_TRAVEL_AGENT'
        | 'AGENT_TYPE_AIRLINE';

    @ApiProperty({ description: 'Image url for the agent or airline selling this flight price' })
    agentImageUrl: string;

    @ApiProperty({ description: 'Agent or airline that sells the flight' })
    agentName: string;
}


class Deal {
    @ApiProperty({ description: 'Price of the flight for this agent in great britisg pounds' })
    price: string;

    @ApiProperty({ isArray: true, description: 'List of urls for this flight' })
    deepLinks: DeepLink;
}


class Leg {
    @ApiProperty({ description: 'Leg Id used by skyscanner for  this leg' })
    id: string;

    @ApiProperty({ description: 'Location from' })
    from: string;

    @ApiProperty({ description: 'Location to' })
    to: string;

    @ApiProperty({ description: 'Duraction of leg of this flight, including stop overs' })
    duration: number;

    @ApiProperty({ description: 'Departure time and date' })
    departure: string;

    @ApiProperty({ description: 'Arrival time and date' })
    arrival: string;

    @ApiProperty({ description: 'How many stops are on this leg of the flight' })
    stops: number;

    @ApiProperty({ isArray: true, description: 'Details for the specific flights for the leg of this flight' })
    segments: Segment;
}

class Flight {
    @ApiProperty({ description: 'Id used by skyscanner for flight id' })
    itineraryId: string;

    @ApiProperty({ isArray: true, description: 'details on each agent prices and url links to the booking for quick access' })
    deals: Deal;

    @ApiProperty({ description: 'cheapest price found for this flight in great british pounds' })
    price: string;

    @ApiProperty({ description: 'Url link for the cheapest option found for this flight' })
    deepLink: string;

    @ApiProperty({ isArray: true, description: 'Flight leg details for single or return' })
    legs: Leg;
}

//types ()

export class Search {
    @ApiProperty({ description: 'Token used by skyscanner for search id' })
    sessionToken: string;

    @ApiProperty({ isArray: true, description: 'Array with all the flights found, limited to a few cheapest flights' })
    flights: Flight;

    @ApiProperty({ description: 'Stats of the search total amount found, min price etc' })
    stats: Stats;

    @ApiProperty({ description: 'Searh url for search on website so you can see all other flight details related to this search' })
    searchUrl: Stats;
}