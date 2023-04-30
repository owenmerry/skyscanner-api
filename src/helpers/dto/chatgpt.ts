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


export class ChatGPTDescription {
    @ApiProperty({ description: 'Description of the deal found from the given location' })
    deal: string;
}