import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoriteDto } from './create-favorite.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateFavoriteDto extends PartialType(CreateFavoriteDto) {
  @ApiPropertyOptional({ description: 'ID do usuário' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'ID da mídia' })
  @IsUUID()
  @IsOptional()
  mediaId?: string;
}
