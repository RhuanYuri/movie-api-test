import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdUserId: string;

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

  describe('/users (POST)', () => {
    it('deve criar um usuário com sucesso e retornar 201', async () => {
      const createUserDto = {
        name: 'Usuário E2E',
        email: 'e2e@teste.com',
        password: 'senhaSegura123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createUserDto.email);

      createdUserId = (response.body as { id: string }).id;
      return response;
    });

    it('deve retornar 409 se o email já existir', async () => {
      const createUserDto = {
        name: 'Usuário Existente',
        email: 'existente@teste.com',
        password: 'senhaSegura123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);
    });

    it('deve retornar 400 se os dados forem inválidos', () => {
      const invalidDto = {
        name: 'U',
        email: 'email-invalido',
        password: '123',
      };
      return request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('deve retornar lista de usuários (200)', async () => {
      await request(app.getHttpServer()).post('/users').send({
        name: 'Usuário List',
        email: 'list@teste.com',
        password: 'senhaSegura123',
      });

      return await request(app.getHttpServer()).get('/users').expect(200);
    });
  });

  describe('/users/:id (GET)', () => {
    it('deve retornar um usuário pelo ID (200)', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Usuário Detalhe',
          email: 'detalhe@teste.com',
          password: 'senhaSegura123',
        })
        .expect(201);

      const body = createResponse.body as {
        id: string;
        name: string;
        email: string;
        password?: string;
      };

      return await request(app.getHttpServer())
        .get(`/users/${body.id}`)
        .expect(200);
    });

    it('deve retornar 404 se o usuário não existir', () => {
      return request(app.getHttpServer()).get('/users/999').expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('deve atualizar um usuário e retornar 200', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Usuário Update',
          email: 'update@teste.com',
          password: 'senhaSegura123',
        })
        .expect(201);
      const body = createResponse.body as {
        id: string;
        name: string;
        email: string;
        password?: string;
      };

      const updateDto = { name: 'Usuário Atualizado' };

      return await request(app.getHttpServer())
        .patch(`/users/${body.id}`)
        .send(updateDto)
        .expect(200);
    });

    it('deve retornar 404 se tentar atualizar usuário inexistente', () => {
      return request(app.getHttpServer())
        .patch('/users/999')
        .send({ name: 'Novo Nome' })
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('deve remover um usuário e retornar 200', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Usuário Delete',
          email: 'delete@teste.com',
          password: 'senhaSegura123',
        })
        .expect(201);
      const body = createResponse.body as {
        id: string;
        name: string;
        email: string;
        password?: string;
      };

      await request(app.getHttpServer())
        .delete(`/users/${body.id}`)
        .expect(200);

      return request(app.getHttpServer()).get(`/users/${body.id}`).expect(404);
    });

    it('deve retornar 404 ao tentar remover usuário inexistente', () => {
      return request(app.getHttpServer()).delete('/users/999').expect(404);
    });
  });
});
