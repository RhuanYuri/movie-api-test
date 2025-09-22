import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID as uuidv4 } from 'node:crypto';
import { isUUID } from 'class-validator';
import { FavoriteService } from './favorite.service';
import { Favorite } from './entities/favorite.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { User } from 'src/users/entities/user.entity';
import { Media } from 'src/media/entities/media.entity';


jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  isUUID: jest.fn(),
}));

describe('FavoriteService', () => {
  let service: FavoriteService;
  let repository: jest.Mocked<Repository<Favorite>>;
  const mockIsUUID = isUUID as jest.Mock;

  const mockUserId = uuidv4();
  const mockMediaId = uuidv4();
  const mockFavorite: Favorite = {
    id: uuidv4(),
    userId: mockUserId,
    mediaId: mockMediaId,
    user: { id: mockUserId } as User,
    media: { id: mockMediaId } as Media,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: getRepositoryToken(Favorite),
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

    service = module.get<FavoriteService>(FavoriteService);
    repository = module.get(getRepositoryToken(Favorite));
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  
  describe('create', () => {
    
    const createDto: CreateFavoriteDto = {
      mediaId: mockMediaId,
    };

    it('deve criar um favorito com sucesso', async () => {
      
      const favoriteData = { ...createDto, userId: mockUserId };
      repository.create.mockReturnValue(mockFavorite);
      repository.save.mockResolvedValue(mockFavorite);

      
      const result = await service.create(createDto, mockUserId);

      
      expect(repository.create).toHaveBeenCalledWith(favoriteData);
      expect(repository.save).toHaveBeenCalledWith(mockFavorite);
      expect(result).toEqual(mockFavorite);
    });

    it('deve lançar InternalServerErrorException se save falhar', async () => {
      
      repository.save.mockRejectedValue(new Error('DB Error'));

      
      
      await expect(service.create(createDto, mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  
  describe('findAll', () => {
    it('deve retornar os favoritos de um usuário', async () => {
      mockIsUUID.mockReturnValue(true);
      repository.find.mockResolvedValue([mockFavorite]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([mockFavorite]);
    });

    it('deve lançar NotFoundException para um userId inválido', async () => {
      mockIsUUID.mockReturnValue(false);

      await expect(service.findAll('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um favorito específico', async () => {
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(mockFavorite);

      const result = await service.findOne(mockFavorite.id, mockUserId);

      expect(result).toEqual(mockFavorite);
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(uuidv4(), mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateFavoriteDto = { mediaId: uuidv4() };

    it('deve atualizar um favorito com sucesso', async () => {
      mockIsUUID.mockReturnValue(true);
      const updatedFavorite = { ...mockFavorite, ...updateDto };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.save.mockResolvedValue(updatedFavorite);

      const result = await service.update(
        mockFavorite.id,
        mockUserId,
        updateDto,
      );

      expect(result.mediaId).toBe(updateDto.mediaId);
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(
        service.update(uuidv4(), mockUserId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um favorito com sucesso', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.remove.mockResolvedValue(mockFavorite);

      await expect(
        service.remove(mockFavorite.id, mockUserId),
      ).resolves.toBeUndefined();
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(uuidv4(), mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
