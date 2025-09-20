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
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { Favorite } from './entities/favorite.entity';

@ApiTags('Favorites')
@Controller('users/:userId/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo favorito para o usuário' })
  @ApiResponse({
    status: 201,
    description: 'Favorito criado com sucesso',
    type: Favorite,
  })
  @ApiResponse({ status: 500, description: 'Erro ao criar favorito' })
  create(
    @Param('userId') userId: string,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    createFavoriteDto.userId = userId;
    return this.favoriteService.create(createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os favoritos de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos do usuário',
    type: [Favorite],
  })
  @ApiResponse({ status: 500, description: 'Erro ao buscar favoritos' })
  findAll(@Param('userId') userId: string) {
    return this.favoriteService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um favorito específico do usuário' })
  @ApiParam({ name: 'id', description: 'ID do favorito', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Favorito encontrado',
    type: Favorite,
  })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  findOne(@Param('userId') userId: string, @Param('id') id: string) {
    return this.favoriteService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um favorito do usuário' })
  @ApiParam({ name: 'id', description: 'ID do favorito', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Favorito atualizado com sucesso',
    type: Favorite,
  })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro ao atualizar favorito' })
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoriteService.update(id, userId, updateFavoriteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um favorito do usuário' })
  @ApiParam({ name: 'id', description: 'ID do favorito', type: 'string' })
  @ApiResponse({ status: 200, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro ao remover favorito' })
  remove(@Param('userId') userId: string, @Param('id') id: string) {
    return this.favoriteService.remove(id, userId);
  }
}
