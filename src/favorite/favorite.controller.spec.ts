import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  const mockFavoriteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        {
          provide: FavoriteService,
          useValue: mockFavoriteService,
        },
      ],
    }).compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um favorito', async () => {
      const dto: CreateFavoriteDto = { userId: '', mediaId: 'media-1' };
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;

      mockFavoriteService.create.mockResolvedValue(favorite);

      const result = await controller.create('user-1', dto);
      expect(result).toEqual(favorite);
      expect(mockFavoriteService.create).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-1',
      });
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      const dto: CreateFavoriteDto = { userId: '', mediaId: 'media-1' };
      mockFavoriteService.create.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.create('user-1', dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os favoritos de um usuário', async () => {
      const favorites: Favorite[] = [
        { id: '1' } as Favorite,
        { id: '2' } as Favorite,
      ];
      mockFavoriteService.findAll.mockResolvedValue(favorites);

      const result = await controller.findAll('user-1');
      expect(result).toEqual(favorites);
      expect(mockFavoriteService.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('deve retornar um favorito específico', async () => {
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-1',
      } as Favorite;
      mockFavoriteService.findOne.mockResolvedValue(favorite);

      const result = await controller.findOne('user-1', '1');
      expect(result).toEqual(favorite);
      expect(mockFavoriteService.findOne).toHaveBeenCalledWith('1', 'user-1');
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockFavoriteService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('user-1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um favorito', async () => {
      const dto: UpdateFavoriteDto = { mediaId: 'media-2' };
      const favorite: Favorite = {
        id: '1',
        userId: 'user-1',
        mediaId: 'media-2',
      } as Favorite;
      mockFavoriteService.update.mockResolvedValue(favorite);

      const result = await controller.update('user-1', '1', dto);
      expect(result).toEqual(favorite);
      expect(mockFavoriteService.update).toHaveBeenCalledWith(
        '1',
        'user-1',
        dto,
      );
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      const dto: UpdateFavoriteDto = { mediaId: 'media-2' };
      mockFavoriteService.update.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.update('user-1', '1', dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deve remover um favorito com sucesso', async () => {
      mockFavoriteService.remove.mockResolvedValue(undefined);

      await controller.remove('user-1', '1');
      expect(mockFavoriteService.remove).toHaveBeenCalledWith('1', 'user-1');
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      mockFavoriteService.remove.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.remove('user-1', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
