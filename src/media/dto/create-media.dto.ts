import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({ description: 'Título da mídia' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Descrição da mídia', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tipo da mídia',
    enum: ['movie', 'series'],
    default: 'movie',
  })
  @IsEnum(['movie', 'series'])
  @IsOptional()
  type?: 'movie' | 'series';

  @ApiProperty({ description: 'Ano de lançamento da mídia', example: 2025 })
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  releaseYear: number;

  @ApiProperty({ description: 'Gênero da mídia', example: 'action' })
  @IsString()
  genre: string;
}
