import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    try {
      const media = this.mediaRepository.create(createMediaDto);
      return await this.mediaRepository.save(media);
    } catch (error) {
      console.error('Error creating media:', error);
      throw new InternalServerErrorException('Erro ao criar mídia');
    }
  }

  async findAll(): Promise<Media[]> {
    try {
      return await this.mediaRepository.find();
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new InternalServerErrorException('Erro ao buscar mídias');
    }
  }

  async findOne(id: string): Promise<Media> {
    try {
      const media = await this.mediaRepository.findOne({ where: { id } });
      if (!media) {
        throw new NotFoundException(`Mídia com id ${id} não encontrada`);
      }
      return media;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao buscar mídia');
    }
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Midia com ID ${id} não encontrado`);
    }
    const media = await this.findOne(id);
    if (!media) {
      throw new NotFoundException(`Mídia com id ${id} não encontrada`);
    }
    Object.assign(media, updateMediaDto);
    try {
      return await this.mediaRepository.save(media);
    } catch (error) {
      console.error('Error updating media:', error);
      throw new InternalServerErrorException('Erro ao atualizar mídia');
    }
  }

  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Midia com ID ${id} não encontrado`);
    }
    const media = await this.findOne(id);
    if (!media) {
      throw new NotFoundException(`Mídia com id ${id} não encontrada`);
    }
    try {
      await this.mediaRepository.remove(media);
    } catch (error) {
      console.error('Error removing media:', error);
      throw new InternalServerErrorException('Erro ao remover mídia');
    }
  }
}
