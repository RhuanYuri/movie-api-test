import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID as uuidv4 } from 'node:crypto';
import { isUUID } from 'class-validator';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  isUUID: jest.fn(),
}));

describe('MediaService', () => {
  let service: MediaService;
  let repository: jest.Mocked<Repository<Media>>;
  const mockIsUUID = isUUID as jest.Mock;

  const mockMedia: Media = {
    id: uuidv4(),
    title: 'Matrix',
    description: 'Filme de ficção científica',
    type: 'movie',
    releaseYear: 1999,
    genre: 'sci-fi',
    createdAt: new Date(),
    updatedAt: new Date(),
    favorites: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(Media),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    repository = module.get(getRepositoryToken(Media));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma mídia com sucesso', async () => {
      const createDto: CreateMediaDto = {
        title: mockMedia.title,
        type: mockMedia.type,
        releaseYear: mockMedia.releaseYear,
        genre: mockMedia.genre,
      };
      repository.create.mockReturnValue(mockMedia);
      repository.save.mockResolvedValue(mockMedia);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockMedia);
      expect(result).toEqual(mockMedia);
    });

    it('deve lançar InternalServerErrorException se o save falhar', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));
      await expect(service.create({} as CreateMediaDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de mídias', async () => {
      repository.find.mockResolvedValue([mockMedia]);
      const result = await service.findAll();
      expect(result).toEqual([mockMedia]);
      expect(repository.find).toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o find falhar', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma mídia se encontrada', async () => {
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(mockMedia);
      const result = await service.findOne(mockMedia.id);
      expect(result).toEqual(mockMedia);
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se a mídia não for encontrada', async () => {
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(mockMedia.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateMediaDto = { title: 'Matrix Reloaded' };

    it('deve atualizar uma mídia com sucesso', async () => {
      const updatedMedia = { ...mockMedia, ...updateDto };
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMedia);
      repository.save.mockResolvedValue(updatedMedia);

      const result = await service.update(mockMedia.id, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(mockMedia.id);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result.title).toBe(updateDto.title);
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);
      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se a mídia a ser atualizada não for encontrada', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.update(mockMedia.id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover uma mídia com sucesso', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMedia);
      repository.remove.mockResolvedValue(undefined as any);

      await expect(service.remove(mockMedia.id)).resolves.toBeUndefined();
      expect(service.findOne).toHaveBeenCalledWith(mockMedia.id);
      expect(repository.remove).toHaveBeenCalledWith(mockMedia);
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);
      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se a mídia a ser removida não for encontrada', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove(mockMedia.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
