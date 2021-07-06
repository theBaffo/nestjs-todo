import { Test } from '@nestjs/testing';
import { Todo } from './entities/todo.entity';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodoStatus } from './entities/todo-status';

import * as faker from 'faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoRepositoryFake } from './mocks/todos.repository.fake';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Repository } from 'typeorm';
import { TodoNotFoundException } from './exceptions/todo.not-found.exception';

describe('TodosController', () => {
  let todosController: TodosController;
  let todosService: TodosService;
  let todosRepository: Repository<Todo>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepositoryFake,
        },
      ],
    }).compile();

    todosService = moduleRef.get<TodosService>(TodosService);
    todosController = moduleRef.get<TodosController>(TodosController);
    todosRepository = moduleRef.get(getRepositoryToken(Todo));
  });

  describe('creating a todo', () => {
    it('creates a todo', async () => {
      // Create a todo
      const title = faker.lorem.sentence();

      const todo = new Todo();
      todo.id = faker.datatype.uuid();
      todo.title = title;
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Mock the result of the save function
      const todosServiceCreateSpy = jest
        .spyOn(todosService, 'create')
        .mockResolvedValue(todo);

      // Call the create function of the service
      const createTodoDto = new CreateTodoDto();
      createTodoDto.title = title;

      const result = await todosController.create(createTodoDto);

      // Assert result
      expect(todosServiceCreateSpy).toBeCalledWith(createTodoDto);
      expect(result).toStrictEqual(todo);
    });
  });

  describe('reading a todo', () => {
    it('reads a todo', async () => {
      const todoId = faker.datatype.uuid();

      const todoToRead = new Todo();
      todoToRead.id = todoId;
      todoToRead.title = faker.lorem.sentence();
      todoToRead.status = TodoStatus.PENDING;
      todoToRead.createdAt = new Date();
      todoToRead.updatedAt = new Date();

      const todosServiceFindOneSpy = jest
        .spyOn(todosService, 'findOne')
        .mockResolvedValue(todoToRead);

      // Call the remove function of the service
      const result = await todosController.findOne(todoId);

      expect(todosServiceFindOneSpy).toHaveBeenCalledWith(todoId);
      expect(result).toStrictEqual(todoToRead);
    });

    // Negative tests

    it('reads a todo - todo not found', async () => {
      // Create a valid todo id
      const todoId = faker.datatype.uuid();

      // Mock the result of 'findOne'
      jest.spyOn(todosRepository, 'findOne').mockResolvedValue(null);

      // Assert the exception
      try {
        // This should throw an exception
        await todosController.findOne(todoId);

        // If not, make the test fail
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TodoNotFoundException);
      }
    });
  });

  describe('reading all todos', () => {
    it('reads all todos', async () => {
      const todoId = faker.datatype.uuid();

      const todoToRead = new Todo();
      todoToRead.id = todoId;
      todoToRead.title = faker.lorem.sentence();
      todoToRead.status = TodoStatus.PENDING;
      todoToRead.createdAt = new Date();
      todoToRead.updatedAt = new Date();

      const todosServiceFindAllSpy = jest
        .spyOn(todosService, 'findAll')
        .mockResolvedValue([todoToRead]);

      // Call the remove function of the service
      const result = await todosController.findAll();

      expect(todosServiceFindAllSpy).toHaveBeenCalled();
      expect(result).toStrictEqual([todoToRead]);
    });

    // Negative tests

    it('reads all todos - no todos', async () => {
      // Mock the result of 'findAll'
      const todosServiceFindAllSpy = jest
        .spyOn(todosService, 'findAll')
        .mockResolvedValue([]);

      // Call the findAll function of the service
      const result = await todosController.findAll();

      expect(todosServiceFindAllSpy).toHaveBeenCalled();

      expect(result).toStrictEqual([]);
    });
  });

  describe('updating a todo', () => {
    it('updates a todo', async () => {
      const todoId = faker.datatype.uuid();

      const todoToUpdate = new Todo();
      todoToUpdate.id = todoId;
      todoToUpdate.title = faker.lorem.sentence();
      todoToUpdate.status = TodoStatus.PENDING;
      todoToUpdate.createdAt = new Date();
      todoToUpdate.updatedAt = new Date();

      const updatedTodo = {
        ...todoToUpdate,
        status: TodoStatus.COMPLETED,
      };

      const todosServiceUpdateSpy = jest
        .spyOn(todosService, 'update')
        .mockResolvedValue(updatedTodo);

      // Call the update function of the service
      const updateTodoDto = new UpdateTodoDto();
      updateTodoDto.status = TodoStatus.COMPLETED;

      const result = await todosController.update(todoId, updateTodoDto);

      expect(todosServiceUpdateSpy).toHaveBeenCalledWith(todoId, updateTodoDto);
      expect(result).toStrictEqual(updatedTodo);
    });

    // Negative tests

    it('updates a todo - todo not found', async () => {
      // Create a valid todo id
      const todoId = faker.datatype.uuid();

      // Mock the result of 'findOne'
      jest.spyOn(todosRepository, 'findOne').mockResolvedValue(null);

      // Assert the exception
      try {
        // Create UpdateTodoDto
        const updateTodoDto = new UpdateTodoDto();
        updateTodoDto.status = TodoStatus.COMPLETED;

        // This should throw an exception
        await todosController.update(todoId, updateTodoDto);

        // If not, make the test fail
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TodoNotFoundException);
      }
    });
  });

  describe('deleting a todo', () => {
    it('deletes a todo', async () => {
      const todoId = faker.datatype.uuid();

      const todoToDelete = new Todo();
      todoToDelete.id = todoId;
      todoToDelete.title = faker.lorem.sentence();
      todoToDelete.status = TodoStatus.PENDING;
      todoToDelete.createdAt = new Date();
      todoToDelete.updatedAt = new Date();

      const todosServiceRemoveSpy = jest
        .spyOn(todosService, 'remove')
        .mockResolvedValue(todoToDelete);

      // Call the remove function of the service
      const result = await todosController.remove(todoId);

      expect(todosServiceRemoveSpy).toHaveBeenCalledWith(todoId);
      expect(result).toStrictEqual(todoToDelete);
    });

    // Negative tests

    it('deletes a todo - todo not found', async () => {
      // Create a valid todo id
      const todoId = faker.datatype.uuid();

      // Mock the result of 'findOne'
      jest.spyOn(todosRepository, 'findOne').mockResolvedValue(null);

      // Assert the exception
      try {
        // This should throw an exception
        await todosController.remove(todoId);

        // If not, make the test fail
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TodoNotFoundException);
      }
    });
  });
});
