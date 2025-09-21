import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Favorite Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;
  let mediaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "favorites", "users", "media" RESTART IDENTITY CASCADE;',
    );

    // cria um usuário
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: '123456' })
      .expect(201);

    const userBody = userResponse.body as { id: string; email: string };
    userId = userBody.id;

    // cria uma mídia
    const mediaResponse = await request(app.getHttpServer())
      .post('/media')
      .send({
        title: 'Filme Favorito',
        type: 'movie',
        releaseYear: 2025,
        genre: 'action',
      })
      .expect(201);

    const mediaBody = mediaResponse.body as {
      id: string;
      title: string;
      type: string;
      releaseYear: number;
      genre: string;
    };
    mediaId = mediaBody.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/:userId/favorites (POST)', () => {
    it('deve criar um favorito (201)', async () => {
      const dto = { mediaId };

      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.mediaId).toBe(mediaId);
      expect(response.body.userId).toBe(userId);
    });

    it('deve retornar 400 se mediaId for inválido', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId: '' })
        .expect(400);
    });
  });

  describe('/users/:userId/favorites (GET)', () => {
    it('deve listar favoritos do usuário (200)', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('/users/:userId/favorites/:id (GET)', () => {
    it('deve retornar um favorito específico (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId })
        .expect(201);

      const { id: favoriteId } = createResponse.body as { id: string };

      const getResponse = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${favoriteId}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('id', favoriteId);
    });

    it('deve retornar 404 se favorito não existir', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/999`)
        .expect(404);
    });
  });

  describe('/users/:userId/favorites/:id (PATCH)', () => {
    it('deve atualizar um favorito (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId })
        .expect(201);

      const { id: favoriteId } = createResponse.body as { id: string };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${favoriteId}`)
        .send({ note: 'Muito bom!' }) // exemplo de campo no UpdateFavoriteDto
        .expect(200);

      expect(updateResponse.body).toHaveProperty('note', 'Muito bom!');
    });

    it('deve retornar 404 se tentar atualizar favorito inexistente', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/999`)
        .send({ note: 'Teste' })
        .expect(404);
    });
  });

  describe('/users/:userId/favorites/:id (DELETE)', () => {
    it('deve remover um favorito (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId })
        .expect(201);

      const { id: favoriteId } = createResponse.body as { id: string };

      await request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/${favoriteId}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${favoriteId}`)
        .expect(404);
    });

    it('deve retornar 404 ao tentar remover favorito inexistente', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/999`)
        .expect(404);
    });
  });
});
