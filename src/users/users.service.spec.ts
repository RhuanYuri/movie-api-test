import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      const user = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.create.mockReturnValue(user as any);
      userRepository.save.mockResolvedValue(user as any);

      const result = await service.create(dto);
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      const users = [{ id: '1', name: 'John' }] as User[];
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se encontrado', async () => {
      const user = { id: '1', name: 'John' } as User;
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const user = { id: '1', name: 'John' } as User;
      const updateDto: UpdateUserDto = { name: 'Jane' };

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, ...updateDto } as User);

      const result = await service.update('1', updateDto);

      expect(result.name).toEqual('Jane');
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        ...updateDto,
      });
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException se usuário não encontrado', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
