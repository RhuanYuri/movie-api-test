import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockMedia: Media = {
  id: '4e3cb6de-828d-4faf-9a1f-a80b6a06fbr3',
  title: 'Matrix',
  description: 'Filme de ação futurista',
  type: 'movie',
  releaseYear: 1999,
  genre: 'action',
  createdAt: new Date(),
  updatedAt: new Date(),
  favorites: [],
};

describe('MediaService', () => {
  let service: MediaService;
  let repository: jest.Mocked<Repository<Media>>;

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

  describe('create', () => {
    it('deve criar e salvar uma mídia', async () => {
      repository.create.mockReturnValue(mockMedia);
      repository.save.mockResolvedValue(mockMedia);

      const dto = {
        title: 'Matrix',
        description: 'Filme de ação futurista',
        type: 'movie' as const,
        releaseYear: 1999,
        genre: 'action',
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockMedia);
      expect(result).toEqual(mockMedia);
    });

    it('deve lançar InternalServerErrorException em erro no save', async () => {
      repository.create.mockReturnValue(mockMedia);
      repository.save.mockRejectedValue(new Error('DB error'));

      const dto = {
        title: 'Matrix',
        releaseYear: 1999,
        genre: 'action',
      };

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as mídias', async () => {
      repository.find.mockResolvedValue([mockMedia]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockMedia]);
    });

    it('deve lançar InternalServerErrorException em erro no find', async () => {
      repository.find.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma mídia pelo id', async () => {
      repository.findOne.mockResolvedValue(mockMedia);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockMedia);
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma mídia existente', async () => {
      repository.findOne.mockResolvedValue(mockMedia);
      repository.save.mockResolvedValue({ ...mockMedia, title: 'Novo título' });

      const result = await service.update('1', { title: 'Novo título' });

      expect(result.title).toBe('Novo título');
    });

    it('deve lançar erro se save falhar', async () => {
      repository.findOne.mockResolvedValue(mockMedia);
      repository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.update('1', { title: 'Falha' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover uma mídia', async () => {
      repository.findOne.mockResolvedValue(mockMedia);
      repository.remove.mockResolvedValue(mockMedia);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockMedia);
    });

    it('deve lançar erro se remove falhar', async () => {
      repository.findOne.mockResolvedValue(mockMedia);
      repository.remove.mockRejectedValue(new Error('DB error'));

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
