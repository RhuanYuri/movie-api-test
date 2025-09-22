import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { randomUUID as uuidv4 } from 'node:crypto';

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "favorites", "users", "media" RESTART IDENTITY CASCADE;',
    );

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test.user@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = userResponse.body.id;
    expect(userId).toBeDefined();

    const mediaResponse = await request(app.getHttpServer())
      .post('/media')
      .send({
        title: 'Filme Original',
        type: 'movie',
        releaseYear: 2025,
        genre: 'action',
      })
      .expect(201);

    mediaId = mediaResponse.body.id;
    expect(mediaId).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/:userId/favorites (POST)', () => {
    it('deve criar um favorito com sucesso (201)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          userId,
          mediaId,
        }),
      );
    });

    it('deve retornar 400 se mediaId não for um UUID', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId: 'id-invalido' })
        .expect(400);
    });
  });

  describe('/users/:userId/favorites (GET)', () => {
    it('deve listar os favoritos de um usuário (200)', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId });

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].mediaId).toBe(mediaId);
    });
  });

  describe('/users/:userId/favorites/:id (GET)', () => {
    it('deve retornar um favorito específico (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId });
      const favoriteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${favoriteId}`)
        .expect(200);

      expect(response.body.id).toBe(favoriteId);
    });

    it('deve retornar 404 se o favorito não existir', () => {
      const nonExistentFavoriteId = uuidv4();
      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${nonExistentFavoriteId}`)
        .expect(404);
    });
  });

  describe('/users/:userId/favorites/:id (PATCH)', () => {
    it('deve atualizar um favorito com sucesso (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId });
      const favoriteId = createResponse.body.id;

      const newMediaResponse = await request(app.getHttpServer())
        .post('/media')
        .send({
          title: 'Filme Atualizado',
          type: 'series',
          releaseYear: 2024,
          genre: 'drama',
        });
      const newMediaId = newMediaResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${favoriteId}`)
        .send({ mediaId: newMediaId })
        .expect(200);

      expect(response.body.mediaId).toBe(newMediaId);
    });

    it('deve retornar 404 se o favorito a ser atualizado não existir', () => {
      const nonExistentFavoriteId = uuidv4();
      return request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${nonExistentFavoriteId}`)
        .send({ mediaId })
        .expect(404);
    });
  });

  describe('/users/:userId/favorites/:id (DELETE)', () => {
    it('deve remover um favorito com sucesso (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ mediaId });
      const favoriteId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/${favoriteId}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${favoriteId}`)
        .expect(404);
    });
  });
});
