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
  BadRequestException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { User } from 'src/users/entities/user.entity';
import { Media } from 'src/media/entities/media.entity';

// Mock global para a função isUUID, essencial para os testes
jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  isUUID: jest.fn(),
}));

describe('FavoriteService', () => {
  let service: FavoriteService;
  let repository: jest.Mocked<Repository<Favorite>>;
  const mockIsUUID = isUUID as jest.Mock;

  const mockUserId = uuidv4();
  const mockFavorite: Favorite = {
    id: uuidv4(),
    userId: mockUserId,
    mediaId: uuidv4(),
    user: { id: mockUserId } as User,
    media: { id: uuidv4() } as Media,
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
      userId: mockUserId,
      mediaId: uuidv4(),
    };

    it('deve criar um favorito com sucesso', async () => {
      // Arrange
      repository.create.mockReturnValue(mockFavorite);
      repository.save.mockResolvedValue(mockFavorite);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockFavorite);
    });

    it('deve lançar InternalServerErrorException se save falhar', async () => {
      // Arrange
      repository.save.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar os favoritos de um usuário', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      repository.find.mockResolvedValue([mockFavorite]);

      // Act
      const result = await service.findAll(mockUserId);

      // Assert
      expect(result).toEqual([mockFavorite]);
    });

    it('deve lançar NotFoundException para um userId inválido', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(false);

      // Act & Assert
      await expect(service.findAll('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar InternalServerErrorException se find falhar', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      repository.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(service.findAll(mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um favorito específico', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(mockFavorite);

      // Act
      const result = await service.findOne(mockFavorite.id, mockUserId);

      // Assert
      expect(result).toEqual(mockFavorite);
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(uuidv4(), mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException para um favoriteId inválido', async () => {
      // Arrange
      mockIsUUID.mockReturnValueOnce(false);

      // Act & Assert
      await expect(service.findOne('invalid-id', mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateFavoriteDto = { mediaId: uuidv4() };

    it('deve atualizar um favorito com sucesso', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      const updatedFavorite = { ...mockFavorite, ...updateDto };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.save.mockResolvedValue(updatedFavorite);

      // Act
      const result = await service.update(
        mockFavorite.id,
        mockUserId,
        updateDto,
      );

      // Assert
      expect(result.mediaId).toBe(updateDto.mediaId);
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        service.update(uuidv4(), mockUserId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar InternalServerErrorException se save falhar', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.save.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(
        service.update(mockFavorite.id, mockUserId, updateDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('deve remover um favorito com sucesso', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.remove.mockResolvedValue(mockFavorite);

      // Act & Assert
      await expect(
        service.remove(mockFavorite.id, mockUserId),
      ).resolves.toBeUndefined();
    });

    it('deve lançar BadRequestException para um favoriteId inválido', async () => {
      // Arrange
      mockIsUUID.mockReturnValueOnce(false);

      // Act & Assert
      await expect(service.remove('invalid-id', mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar NotFoundException se o favorito não for encontrado', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.remove(uuidv4(), mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar InternalServerErrorException se a remoção falhar', async () => {
      // Arrange
      mockIsUUID.mockReturnValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockFavorite);
      repository.remove.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(service.remove(mockFavorite.id, mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
