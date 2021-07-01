import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as faker from 'faker';

import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodoRepositoryFake } from './mocks/todos.repository.fake';
import { TodosService } from './todos.service';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoStatus } from './entities/todo-status';

describe('TodosService', () => {
  let todosService: TodosService;
  let todosRepository: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepositoryFake,
        },
      ],
    }).compile();

    todosService = module.get(TodosService);
    todosRepository = module.get(getRepositoryToken(Todo));
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
      const todosRepositorySaveSpy = jest
        .spyOn(todosRepository, 'save')
        .mockResolvedValue(todo);

      // Call the create function of the service
      const createTodoDto = new CreateTodoDto();
      createTodoDto.title = title;

      const result = await todosService.create(createTodoDto);

      // Assert result
      expect(todosRepositorySaveSpy).toBeCalledWith(createTodoDto);
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
        .spyOn(todosRepository, 'findOne')
        .mockResolvedValue(todoToRead);

      // Call the remove function of the service
      const result = await todosService.findOne(todoId);

      expect(todosServiceFindOneSpy).toHaveBeenCalledWith(todoId, {
        relations: ['subtasks'],
      });

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

      const todosServiceFindSpy = jest
        .spyOn(todosRepository, 'find')
        .mockResolvedValue([todoToRead]);

      // Call the remove function of the service
      const result = await todosService.findAll();

      expect(todosServiceFindSpy).toHaveBeenCalledWith({
        relations: ['subtasks'],
      });

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

      const todosServiceFindOneSpy = jest
        .spyOn(todosRepository, 'findOne')
        .mockResolvedValue(todoToUpdate);

      const todosServiceSaveSpy = jest
        .spyOn(todosRepository, 'save')
        .mockResolvedValue(updatedTodo);

      // Call the update function of the service
      const updateTodoDto = new UpdateTodoDto();
      updateTodoDto.status = TodoStatus.COMPLETED;

      const result = await todosService.update(todoId, updateTodoDto);

      expect(todosServiceFindOneSpy).toHaveBeenCalledWith(todoId, {
        relations: ['subtasks'],
      });
      expect(todosServiceSaveSpy).toHaveBeenCalledWith(updatedTodo);

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

      const todosServiceFindOneSpy = jest
        .spyOn(todosRepository, 'findOne')
        .mockResolvedValue(todoToDelete);

      const todosServiceRemoveSpy = jest
        .spyOn(todosRepository, 'remove')
        .mockResolvedValue(todoToDelete);

      // Call the remove function of the service
      const result = await todosService.remove(todoId);

      expect(todosServiceFindOneSpy).toHaveBeenCalledWith(todoId, {
        relations: ['subtasks'],
      });
      expect(todosServiceRemoveSpy).toHaveBeenCalledWith(todoToDelete);

      expect(result).toStrictEqual(todoToDelete);
    });
  });
});
