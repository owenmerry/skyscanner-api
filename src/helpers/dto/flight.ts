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
    @ApiProperty()
    id: string;

    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string;

    @ApiProperty()
    duration: number;

    @ApiProperty()
    departure: string;

    @ApiProperty()
    arrival: string;
}

class Stats {
    @ApiProperty()
    total: number;

    @ApiProperty()
    minPrice: string;
}

class DeepLink {

    @ApiProperty()
    link: string;

    @ApiProperty()
    type:
        | 'AGENT_TYPE_UNSPECIFIED'
        | 'AGENT_TYPE_TRAVEL_AGENT'
        | 'AGENT_TYPE_AIRLINE';

    @ApiProperty()
    agentImageUrl: string;

    @ApiProperty()
    agentName: string;
}


class Deal {
    @ApiProperty()
    price: string;

    @ApiProperty({ isArray: true, })
    deepLinks: DeepLink;
}


class Leg {
    @ApiProperty()
    id: string;

    @ApiProperty()
    from: string;

    @ApiProperty()
    to: string;

    @ApiProperty()
    duration: number;

    @ApiProperty()
    departure: string;

    @ApiProperty()
    arrival: string;

    @ApiProperty()
    stops: number;

    @ApiProperty({ isArray: true, })
    segments: Segment;
}

class Flight {
    @ApiProperty()
    itineraryId: string;

    @ApiProperty({ isArray: true, })
    deals: Deal;

    @ApiProperty()
    price: string;

    @ApiProperty()
    deepLink: string;

    @ApiProperty({ isArray: true, })
    legs: Leg;
}

//types ()

export class Search {
    @ApiProperty()
    sessionToken: string;

    @ApiProperty({ isArray: true, })
    best: Flight;

    @ApiProperty({ isArray: true, })
    cheapest: Flight;

    @ApiProperty({ isArray: true, })
    fastest: Flight;

    @ApiProperty()
    stats: Stats;
}