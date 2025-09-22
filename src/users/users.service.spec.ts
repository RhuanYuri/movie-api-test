import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID as uuidv4 } from 'node:crypto';
import { isUUID } from 'class-validator';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  isUUID: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  const mockIsUUID = isUUID as jest.Mock;

  const mockUser: User = {
    id: uuidv4(),
    name: 'John Doe',
    email: 'john.doe@test.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    favorites: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@test.com',
      password: 'password123',
    };

    it('deve criar um usuário com sucesso', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
    });

    it('deve lançar ConflictException se o e-mail já estiver em uso', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar um erro genérico se save falhar', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      userRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      const { password, ...expectedUser } = mockUser;

      expect(result).toEqual([expectedUser]);
    });

    it('deve lançar um erro genérico se find falhar', async () => {
      userRepository.find.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      const { password, ...expectedUser } = mockUser;

      expect(result).toEqual(expectedUser);
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar um erro genérico se findOne falhar', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(service.findOne(mockUser.id)).rejects.toThrow();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { name: 'Jane Doe' };

    it('deve atualizar um usuário com sucesso', async () => {
      mockIsUUID.mockReturnValue(true);
      const updatedUser = { ...mockUser, ...updateDto };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar um erro genérico se save falhar', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(mockUser.id)).resolves.toBeUndefined();
    });

    it('deve lançar NotFoundException se o ID não for um UUID', async () => {
      mockIsUUID.mockReturnValue(false);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar um erro genérico se delete falhar', async () => {
      mockIsUUID.mockReturnValue(true);
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.delete.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(mockUser.id)).rejects.toThrow();
    });
  });
});
