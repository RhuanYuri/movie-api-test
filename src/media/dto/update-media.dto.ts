import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaDto } from './create-media.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateMediaDto extends PartialType(CreateMediaDto) {
  @ApiPropertyOptional({ description: 'Título da mídia' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição da mídia' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tipo da mídia',
    enum: ['movie', 'series'],
  })
  @IsEnum(['movie', 'series'])
  @IsOptional()
  type?: 'movie' | 'series';

  @ApiPropertyOptional({
    description: 'Ano de lançamento da mídia',
    example: 2025,
  })
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  @IsOptional()
  releaseYear?: number;

  @ApiPropertyOptional({ description: 'Gênero da mídia' })
  @IsString()
  @IsOptional()
  genre?: string;
}
