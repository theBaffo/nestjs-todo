import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TodosModule } from '../../src/todos/todos.module';
import { Todo } from '../../src/todos/entities/todo.entity';
import { Subtask } from '../../src/todos/entities/subtask.entity';
import { TodoStatus } from '../../src/todos/entities/todo-status';
import { TodoNotFoundException } from '../../src/todos/exceptions/todo.not-found.exception';
import { SubtaskNotFoundException } from '../../src/todos/exceptions/subtask.not-found.exception';

import * as faker from 'faker';
import * as request from 'supertest';

describe('Todos', () => {
  let app: INestApplication;
  let todoRepository: Repository<Todo>;
  let subtaskRepository: Repository<Subtask>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TodosModule,
        // Use the e2e_test database to run the tests
        TypeOrmModule.forRoot({
          type: 'sqlite',
          entities: [Todo, Subtask],
          database: 'test.sqlite3',
          synchronize: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    todoRepository = module.get('TodoRepository');
    subtaskRepository = module.get('SubtaskRepository');
  });

  afterEach(async () => {
    await subtaskRepository.clear();
    await todoRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // Todos

  describe('GET /todos', () => {
    it('should return an array of todos', async () => {
      const title = faker.lorem.sentence();
      await todoRepository.save([{ title }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get('/todos')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([
        {
          id: expect.any(String),
          title,
          status: TodoStatus.PENDING,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          subtasks: [],
        },
      ]);
    });

    // Negative tests

    it('should return an empty array', async () => {
      const { body } = await request
        .agent(app.getHttpServer())
        .get('/todos')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([]);
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single todo', async () => {
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await todoRepository.save([{ id, title }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get(`/todos/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        id,
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        subtasks: [],
      });
    });

    // Negative tests

    it("should return 'todo not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get(`/todos/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new TodoNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });

  describe('POST /todos', () => {
    it('should create a single todo', async () => {
      const title = faker.lorem.sentence();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .post(`/todos`)
        .set('Accept', 'application/json')
        .send({ title })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({
        id: expect.any(String),
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update a single todo', async () => {
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await todoRepository.save([{ id, title }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .patch(`/todos/${id}`)
        .set('Accept', 'application/json')
        .send({ status: TodoStatus.COMPLETED })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        id,
        title,
        status: TodoStatus.COMPLETED,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        subtasks: [],
      });
    });

    // Negative tests

    it("should return 'todo not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .patch(`/todos/${id}`)
        .set('Accept', 'application/json')
        .send({ status: TodoStatus.COMPLETED })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new TodoNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });

  describe('DEL /todos/:id', () => {
    it('should delete a single todo', async () => {
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await todoRepository.save([{ id, title }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .del(`/todos/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        subtasks: [],
      });
    });

    // Negative tests

    it("should return 'todo not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .del(`/todos/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new TodoNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });

  // Subtasks

  describe('GET /subtasks', () => {
    it('should return an array of subtasks', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();
      const todo = await todoRepository.save({
        id: todoId,
        title: faker.lorem.sentence(),
      });

      // Create a subtask
      const title = faker.lorem.sentence();
      await subtaskRepository.save([{ title, todo }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get('/subtasks')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([
        {
          id: expect.any(String),
          title,
          status: TodoStatus.PENDING,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });

    // Negative tests

    it('should return an empty array', async () => {
      const { body } = await request
        .agent(app.getHttpServer())
        .get('/subtasks')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([]);
    });
  });

  describe('GET /subtasks/:id', () => {
    it('should return a single subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();
      const todo = await todoRepository.save({
        id: todoId,
        title: faker.lorem.sentence(),
      });

      // Create a subtask
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await subtaskRepository.save([{ id, title, todo }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        id,
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    // Negative tests

    it("should return 'subtask not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .get(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new SubtaskNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });

  describe('POST /subtasks', () => {
    it('should create a single subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();
      await todoRepository.save({
        id: todoId,
        title: faker.lorem.sentence(),
      });

      // Create a subtask
      const title = faker.lorem.sentence();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .post(`/subtasks`)
        .set('Accept', 'application/json')
        .send({ title, todoId })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({
        id: expect.any(String),
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        todo: expect.any(Object),
      });
    });

    // Negative tests

    it("should return 'todo not found'", async () => {
      const todoId = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .post(`/subtasks`)
        .set('Accept', 'application/json')
        .send({ title, todoId })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new TodoNotFoundException(todoId).message,
        statusCode: 404,
      });
    });
  });

  describe('PATCH /subtasks/:id', () => {
    it('should update a single subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();
      const todo = await todoRepository.save({
        id: todoId,
        title: faker.lorem.sentence(),
      });

      // Create a subtask
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await subtaskRepository.save([{ id, title, todo }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .patch(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .send({ status: TodoStatus.COMPLETED })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        id,
        title,
        status: TodoStatus.COMPLETED,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    // Negative tests

    it("should return 'subtask not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .patch(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .send({ status: TodoStatus.COMPLETED })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new SubtaskNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });

  describe('DEL /subtasks/:id', () => {
    it('should delete a single subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();
      const todo = await todoRepository.save({
        id: todoId,
        title: faker.lorem.sentence(),
      });

      // Create a subtask
      const id = faker.datatype.uuid();
      const title = faker.lorem.sentence();

      await subtaskRepository.save([{ id, title, todo }]);

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .del(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual({
        title,
        status: TodoStatus.PENDING,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return 'subtask not found'", async () => {
      const id = faker.datatype.uuid();

      // Run your end-to-end test
      const { body } = await request
        .agent(app.getHttpServer())
        .del(`/subtasks/${id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(body).toEqual({
        error: '404',
        message: new SubtaskNotFoundException(id).message,
        statusCode: 404,
      });
    });
  });
});
