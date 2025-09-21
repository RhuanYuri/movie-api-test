import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar uma lista de usuários', async () => {
      const result = [new User()];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo id', async () => {
      const user = new User();
      user.id = '1';
      mockUsersService.findOne.mockResolvedValue(user);

      expect(await controller.findOne('1')).toBe(user);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar e retornar um usuário', async () => {
      const dto = {
        name: 'John',
        email: 'john@example.com',
        password: '123456',
      };
      const user = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(user);

      expect(await controller.create(dto)).toBe(user);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o usuário', async () => {
      const dto = { name: 'Jane' };
      const user = { id: '1', name: 'Jane', email: 'john@example.com' };
      mockUsersService.update.mockResolvedValue(user);

      expect(await controller.update('1', dto)).toBe(user);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('deve remover o usuário', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
