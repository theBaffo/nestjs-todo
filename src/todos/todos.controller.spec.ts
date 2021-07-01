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

describe('TodosController', () => {
  let todosController: TodosController;
  let todosService: TodosService;

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
  });
});
