import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Media Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "favorites", "users", "media" RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/media (POST)', () => {
    it('deve criar uma mídia com sucesso (201)', async () => {
      const dto = {
        title: 'Filme Teste',
        description: 'Descrição do filme teste',
        type: 'movie',
        releaseYear: 2025,
        genre: 'action',
      };

      return await request(app.getHttpServer())
        .post('/media')
        .send(dto)
        .expect(201);
    });

    it('deve retornar 400 se os dados forem inválidos', () => {
      const invalidDto = { title: '', type: 'invalid-type' };
      return request(app.getHttpServer())
        .post('/media')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/media (GET)', () => {
    it('deve retornar lista de mídias (200)', async () => {
      await request(app.getHttpServer()).post('/media').send({
        title: 'Filme List',
        type: 'movie',
        releaseYear: 2024,
        genre: 'drama',
      });

      return await request(app.getHttpServer()).get('/media').expect(200);
    });
  });

  describe('/media/:id (GET)', () => {
    it('deve retornar uma mídia pelo ID (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/media')
        .send({
          title: 'Filme Detalhe',
          type: 'series',
          releaseYear: 2023,
          genre: 'comedy',
        })
        .expect(201);

      const body = createResponse.body as { id: string };

      return await request(app.getHttpServer())
        .get(`/media/${body.id}`)
        .expect(200);
    });

    it('deve retornar 404 se a mídia não existir', () => {
      return request(app.getHttpServer()).get('/media/999').expect(404);
    });
  });

  describe('/media/:id (PATCH)', () => {
    it('deve atualizar uma mídia (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/media')
        .send({
          title: 'Filme Update',
          type: 'movie',
          releaseYear: 2022,
          genre: 'thriller',
        })
        .expect(201);

      const body = createResponse.body as { id: string };

      const updateDto = { title: 'Filme Atualizado' };

      return await request(app.getHttpServer())
        .patch(`/media/${body.id}`)
        .send(updateDto)
        .expect(200);
    });

    it('deve retornar 404 se tentar atualizar mídia inexistente', () => {
      return request(app.getHttpServer())
        .patch('/media/999')
        .send({ title: 'Inexistente' })
        .expect(404);
    });
  });

  describe('/media/:id (DELETE)', () => {
    it('deve remover uma mídia (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/media')
        .send({
          title: 'Filme Delete',
          type: 'movie',
          releaseYear: 2021,
          genre: 'horror',
        })
        .expect(201);

      const body = createResponse.body as { id: string };

      await request(app.getHttpServer())
        .delete(`/media/${body.id}`)
        .expect(200);

      return request(app.getHttpServer()).get(`/media/${body.id}`).expect(404);
    });

    it('deve retornar 404 ao tentar remover mídia inexistente', () => {
      return request(app.getHttpServer()).delete('/media/999').expect(404);
    });
  });
});
