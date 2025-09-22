import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID da mídia', example: 'uuid-da-midia' })
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;
}
