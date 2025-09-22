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
import { randomUUID as uuidv4 } from 'node:crypto';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: jest.Mocked<FavoriteService>; 

  
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
    service = module.get<FavoriteService>(
      FavoriteService,
    ) as jest.Mocked<FavoriteService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  
  describe('create', () => {
    it('deve chamar o serviço com os parâmetros corretos e criar um favorito', async () => {
      
      const createDto: CreateFavoriteDto = { mediaId: 'media-1' };
      const userId = 'user-1';
      const expectedFavorite: Favorite = {
        id: uuidv4(),
        userId,
        ...createDto,
      } as Favorite;

      service.create.mockResolvedValue(expectedFavorite);

      
      const result = await controller.create(userId, createDto);

      
      expect(result).toEqual(expectedFavorite);
      
      expect(service.create).toHaveBeenCalledWith(createDto, userId);
    });

    it('deve repassar a exceção se o serviço falhar', async () => {
      const createDto: CreateFavoriteDto = { mediaId: 'media-1' };
      const userId = 'user-1';
      service.create.mockRejectedValue(new InternalServerErrorException());

      await expect(controller.create(userId, createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  
  describe('findAll', () => {
    it('deve retornar todos os favoritos de um usuário', async () => {
      const favorites: Favorite[] = [{ id: '1' } as Favorite];
      service.findAll.mockResolvedValue(favorites);

      const result = await controller.findAll('user-1');

      expect(result).toEqual(favorites);
      expect(service.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('deve retornar um favorito específico', async () => {
      const favorite: Favorite = { id: '1' } as Favorite;
      service.findOne.mockResolvedValue(favorite);

      const result = await controller.findOne('user-1', '1');

      expect(result).toEqual(favorite);
      expect(service.findOne).toHaveBeenCalledWith('1', 'user-1');
    });

    it('deve repassar NotFoundException se o favorito não for encontrado', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('user-1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um favorito', async () => {
      const dto: UpdateFavoriteDto = { mediaId: 'media-2' };
      const favorite: Favorite = { id: '1' } as Favorite;
      service.update.mockResolvedValue(favorite);

      const result = await controller.update('user-1', '1', dto);

      expect(result).toEqual(favorite);
      expect(service.update).toHaveBeenCalledWith('1', 'user-1', dto);
    });
  });

  describe('remove', () => {
    it('deve remover um favorito com sucesso', async () => {
      service.remove.mockResolvedValue(undefined); 

      await expect(controller.remove('user-1', '1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
