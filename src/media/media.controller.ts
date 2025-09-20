import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova mídia' })
  @ApiResponse({
    status: 201,
    description: 'Mídia criada com sucesso',
    type: Media,
  })
  @ApiResponse({ status: 500, description: 'Erro ao criar mídia' })
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todas as mídias' })
  @ApiResponse({ status: 200, description: 'Lista de mídias', type: [Media] })
  @ApiResponse({ status: 500, description: 'Erro ao buscar mídias' })
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma mídia pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da mídia', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mídia encontrada', type: Media })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma mídia pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da mídia', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mídia atualizada', type: Media })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro ao atualizar mídia' })
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma mídia pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da mídia', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mídia removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Mídia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro ao remover mídia' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
