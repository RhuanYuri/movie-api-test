import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let repository: Repository<Favorite>;

  const mockFavoriteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    repository = module.get<Repository<Favorite>>(getRepositoryToken(Favorite));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e salvar um favorito', async () => {
      const dto: CreateFavoriteDto = { userId: 'user-1', mediaId: 'media-1' };
      const favorite: Favorite = { id: '1', ...dto } as Favorite;

      mockFavoriteRepository.create.mockReturnValue(favorite);
      mockFavoriteRepository.save.mockResolvedValue(favorite);

      const result = await service.create(dto);
      expect(result).toEqual(favorite);
      expect(mockFavoriteRepository.create).toHaveBeenCalledWith(dto);
      expect(mockFavoriteRepository.save).toHaveBeenCalledWith(favorite);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      mockFavoriteRepository.create.mockImplementation(() => {
        throw new Error();
      });

      await expect(
        service.create({ userId: 'u', mediaId: 'm' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os favoritos de um usuário', async () => {
      const favorites = [{ id: '1' }, { id: '2' }] as Favorite[];
      mockFavoriteRepository.find.mockResolvedValue(favorites);

      const result = await service.findAll('user-1');
      expect(result).toEqual(favorites);
      expect(mockFavoriteRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['user', 'media'],
      });
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      mockFavoriteRepository.find.mockRejectedValue(new Error());
      await expect(service.findAll('user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um favorito específico', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      mockFavoriteRepository.findOne.mockResolvedValue(favorite);

      const result = await service.findOne('1', 'user-1');
      expect(result).toEqual(favorite);
      expect(mockFavoriteRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-1' },
        relations: ['user', 'media'],
      });
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um favorito', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      const dto: UpdateFavoriteDto = { mediaId: 'media-2' };

      jest.spyOn(service, 'findOne').mockResolvedValue(favorite);
      mockFavoriteRepository.save.mockResolvedValue({
        ...favorite,
        ...dto,
      } as Favorite);

      const result = await service.update('1', 'user-1', dto);
      expect(result.mediaId).toBe('media-2');
      expect(mockFavoriteRepository.save).toHaveBeenCalledWith({
        ...favorite,
        ...dto,
      });
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      jest.spyOn(service, 'findOne').mockResolvedValue(favorite);
      mockFavoriteRepository.save.mockRejectedValue(new Error());

      await expect(
        service.update('1', 'user-1', { mediaId: 'media-2' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('deve remover um favorito com sucesso', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      jest.spyOn(service, 'findOne').mockResolvedValue(favorite);
      mockFavoriteRepository.remove.mockResolvedValue(undefined);

      await service.remove('1', 'user-1');
      expect(mockFavoriteRepository.remove).toHaveBeenCalledWith(favorite);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      jest.spyOn(service, 'findOne').mockResolvedValue(favorite);
      mockFavoriteRepository.remove.mockRejectedValue(new Error());

      await expect(service.remove('1', 'user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
