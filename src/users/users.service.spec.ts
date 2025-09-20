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
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
        password: '1234',
      };
      const user = { id: '1', ...dto };

      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.create(dto);
      expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      const users = [{ id: '1', name: 'John' }];
      mockUserRepository.find.mockResolvedValue(users as any);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se encontrado', async () => {
      const user = { id: '1', name: 'John' };
      mockUserRepository.findOne.mockResolvedValue(user as any);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockUserRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const user = { id: '1', name: 'John' };
      const updateDto: UpdateUserDto = { name: 'Jane' };

      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        ...updateDto,
      } as any);

      const result = await service.update('1', updateDto);
      expect(result.name).toEqual('Jane');
    });
  });

  describe('remove', () => {
    it('deve remover um usuário com sucesso', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException se usuário não encontrado', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
