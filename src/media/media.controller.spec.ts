import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { NotFoundException } from '@nestjs/common';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  const mockMediaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e retornar uma mídia', async () => {
      const dto: CreateMediaDto = {
        title: 'Avengers',
        description: 'Superhero movie',
        type: 'movie',
        releaseYear: 2012,
        genre: 'action',
      };
      const media: Media = { id: '1', ...dto } as Media;

      mockMediaService.create.mockResolvedValue(media);

      const result = await controller.create(dto);
      expect(result).toEqual(media);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de mídias', async () => {
      const medias: Media[] = [
        { id: '1', title: 'Avengers' } as Media,
        { id: '2', title: 'Inception' } as Media,
      ];
      mockMediaService.findAll.mockResolvedValue(medias);

      const result = await controller.findAll();
      expect(result).toEqual(medias);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar uma mídia pelo id', async () => {
      const media: Media = { id: '1', title: 'Avengers' } as Media;
      mockMediaService.findOne.mockResolvedValue(media);

      const result = await controller.findOne('1');
      expect(result).toEqual(media);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException se mídia não for encontrada', async () => {
      mockMediaService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar a mídia', async () => {
      const dto: UpdateMediaDto = { title: 'Avengers Updated' };
      const media: Media = { id: '1', title: 'Avengers Updated' } as Media;

      mockMediaService.update.mockResolvedValue(media);

      const result = await controller.update('1', dto);
      expect(result).toEqual(media);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('deve remover a mídia com sucesso', async () => {
      mockMediaService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
