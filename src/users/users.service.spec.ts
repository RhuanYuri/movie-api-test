import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e salvar um usuário', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        email: 'john@test.com',
        password: '123456',
      };

      const user: User = {
        id: uuidv4(),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      const users: User[] = [
        { id: uuidv4(), name: 'John', email: 'john@test.com', password: '123', createdAt: new Date(), updatedAt: new Date() } as User,
      ];

      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se encontrado', async () => {
      const id = uuidv4();
      const user: User = { id, name: 'John', email: 'john@test.com', password: '123', createdAt: new Date(), updatedAt: new Date() } as User;

      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(id);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(user);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      const id = uuidv4();
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const id = uuidv4();
      const user: User = { id, name: 'John', email: 'john@test.com', password: '123', createdAt: new Date(), updatedAt: new Date() } as User;
      const updateDto: UpdateUserDto = { name: 'Jane' };

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, ...updateDto } as User);

      const result = await service.update(id, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, ...updateDto });
      expect(result.name).toEqual('Jane');
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      const id = '1';
      userRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(id)).resolves.toBeUndefined();
      expect(userRepository.delete).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException se usuário não encontrado', async () => {
      const id = '1';
      userRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(userRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
