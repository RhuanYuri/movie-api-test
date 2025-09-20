import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    try {
      const favorite = this.favoriteRepository.create(createFavoriteDto);
      return await this.favoriteRepository.save(favorite);
    } catch (error) {
      console.error('Error creating favorite:', error);
      throw new InternalServerErrorException('Erro ao criar favorito');
    }
  }

  async findAll(userId: string): Promise<Favorite[]> {
    try {
      return await this.favoriteRepository.find({
        where: { userId },
        relations: ['user', 'media'],
      });
    } catch (error) {
      console.error(`Error fetching favorites for user ${userId}:`, error);
      throw new InternalServerErrorException(
        'Erro ao buscar favoritos do usuário',
      );
    }
  }

  async findOne(id: string, userId: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id, userId },
      relations: ['user', 'media'],
    });

    if (!favorite) {
      throw new NotFoundException(
        `Favorito com id ${id} para o usuário ${userId} não encontrado`,
      );
    }

    return favorite;
  }

  async update(
    id: string,
    userId: string,
    updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<Favorite> {
    const favorite = await this.findOne(id, userId);
    Object.assign(favorite, updateFavoriteDto);

    try {
      return await this.favoriteRepository.save(favorite);
    } catch (error) {
      console.error(`Error updating favorite ${id} for user ${userId}:`, error);
      throw new InternalServerErrorException('Erro ao atualizar favorito');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const favorite = await this.findOne(id, userId);

    try {
      await this.favoriteRepository.remove(favorite);
    } catch (error) {
      console.error(`Error removing favorite ${id} for user ${userId}:`, error);
      throw new InternalServerErrorException('Erro ao remover favorito');
    }
  }
}
