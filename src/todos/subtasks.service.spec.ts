import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as faker from 'faker';

import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { Subtask } from './entities/subtask.entity';
import { SubtaskRepositoryFake } from './mocks/subtasks.repository.fake';
import { SubtasksService } from './subtasks.service';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtaskStatus } from './entities/subtask-status';
import { Todo } from './entities/todo.entity';
import { TodoStatus } from './entities/todo-status';
import { TodoRepositoryFake } from './mocks/todos.repository.fake';
import { TodosService } from './todos.service';

describe('SubtasksService', () => {
  let subtasksService: SubtasksService;
  let todosService: TodosService;
  let subtasksRepository: Repository<Subtask>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        TodosService,
        {
          provide: getRepositoryToken(Subtask),
          useClass: SubtaskRepositoryFake,
        },
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepositoryFake,
        },
      ],
    }).compile();

    subtasksService = module.get(SubtasksService);
    todosService = module.get(TodosService);
    subtasksRepository = module.get(getRepositoryToken(Subtask));
  });

  describe('creating a subtask', () => {
    it('creates a subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();

      const todo = new Todo();
      todo.id = todoId;
      todo.title = faker.lorem.sentence();
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Create a subtask
      const title = faker.lorem.sentence();

      const subtask = new Subtask();
      subtask.id = faker.datatype.uuid();
      subtask.title = title;
      subtask.status = SubtaskStatus.PENDING;
      subtask.createdAt = new Date();
      subtask.updatedAt = new Date();
      subtask.todo = todo;

      // Mock the result of the findOne function
      const todosServiceFindOneSpy = jest
        .spyOn(todosService, 'findOne')
        .mockResolvedValue(todo);

      // Mock the result of the save function
      const subtasksRepositorySaveSpy = jest
        .spyOn(subtasksRepository, 'save')
        .mockResolvedValue(subtask);

      // Call the create function of the service
      const createSubtaskDto = new CreateSubtaskDto();
      createSubtaskDto.title = title;
      createSubtaskDto.todoId = todoId;

      const result = await subtasksService.create(createSubtaskDto);

      // Create save method payload
      const payload = {
        title: createSubtaskDto.title,
        todo,
      };

      // Assert result
      expect(todosServiceFindOneSpy).toBeCalledWith(todoId);
      expect(subtasksRepositorySaveSpy).toBeCalledWith(payload);
      expect(result).toStrictEqual(subtask);
    });
  });

  describe('reading a subtask', () => {
    it('reads a subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();

      const todo = new Todo();
      todo.id = todoId;
      todo.title = faker.lorem.sentence();
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Create a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToRead = new Subtask();
      subtaskToRead.id = subtaskId;
      subtaskToRead.title = faker.lorem.sentence();
      subtaskToRead.status = SubtaskStatus.PENDING;
      subtaskToRead.createdAt = new Date();
      subtaskToRead.updatedAt = new Date();
      subtaskToRead.todo = todo;

      const subtasksServiceFindOneSpy = jest
        .spyOn(subtasksRepository, 'findOne')
        .mockResolvedValue(subtaskToRead);

      // Call the remove function of the service
      const result = await subtasksService.findOne(subtaskId);

      expect(subtasksServiceFindOneSpy).toHaveBeenCalledWith(subtaskId);

      expect(result).toStrictEqual(subtaskToRead);
    });
  });

  describe('reading all subtasks', () => {
    it('reads all subtasks', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();

      const todo = new Todo();
      todo.id = todoId;
      todo.title = faker.lorem.sentence();
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Creates a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToRead = new Subtask();
      subtaskToRead.id = subtaskId;
      subtaskToRead.title = faker.lorem.sentence();
      subtaskToRead.status = SubtaskStatus.PENDING;
      subtaskToRead.createdAt = new Date();
      subtaskToRead.updatedAt = new Date();
      subtaskToRead.todo = todo;

      const subtasksServiceFindSpy = jest
        .spyOn(subtasksRepository, 'find')
        .mockResolvedValue([subtaskToRead]);

      // Call the remove function of the service
      const result = await subtasksService.findAll();

      expect(subtasksServiceFindSpy).toHaveBeenCalledWith();

      expect(result).toStrictEqual([subtaskToRead]);
    });
  });

  describe('updating a subtask', () => {
    it('updates a subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();

      const todo = new Todo();
      todo.id = todoId;
      todo.title = faker.lorem.sentence();
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Create a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToUpdate = new Subtask();
      subtaskToUpdate.id = subtaskId;
      subtaskToUpdate.title = faker.lorem.sentence();
      subtaskToUpdate.status = SubtaskStatus.PENDING;
      subtaskToUpdate.createdAt = new Date();
      subtaskToUpdate.updatedAt = new Date();
      subtaskToUpdate.todo = todo;

      const updatedSubtask = {
        ...subtaskToUpdate,
        status: SubtaskStatus.COMPLETED,
      };

      const subtasksServiceFindOneSpy = jest
        .spyOn(subtasksRepository, 'findOne')
        .mockResolvedValue(subtaskToUpdate);

      const subtasksServiceSaveSpy = jest
        .spyOn(subtasksRepository, 'save')
        .mockResolvedValue(updatedSubtask);

      // Call the update function of the service
      const updateSubtaskDto = new UpdateSubtaskDto();
      updateSubtaskDto.status = SubtaskStatus.COMPLETED;

      const result = await subtasksService.update(subtaskId, updateSubtaskDto);

      expect(subtasksServiceFindOneSpy).toHaveBeenCalledWith(subtaskId);
      expect(subtasksServiceSaveSpy).toHaveBeenCalledWith(updatedSubtask);

      expect(result).toStrictEqual(updatedSubtask);
    });
  });

  describe('deleting a subtask', () => {
    it('deletes a subtask', async () => {
      // Create a todo
      const todoId = faker.datatype.uuid();

      const todo = new Todo();
      todo.id = todoId;
      todo.title = faker.lorem.sentence();
      todo.status = TodoStatus.PENDING;
      todo.createdAt = new Date();
      todo.updatedAt = new Date();

      // Create a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToDelete = new Subtask();
      subtaskToDelete.id = subtaskId;
      subtaskToDelete.title = faker.lorem.sentence();
      subtaskToDelete.status = SubtaskStatus.PENDING;
      subtaskToDelete.createdAt = new Date();
      subtaskToDelete.updatedAt = new Date();
      subtaskToDelete.todo = todo;

      const subtasksServiceFindOneSpy = jest
        .spyOn(subtasksRepository, 'findOne')
        .mockResolvedValue(subtaskToDelete);

      const subtasksServiceRemoveSpy = jest
        .spyOn(subtasksRepository, 'remove')
        .mockResolvedValue(subtaskToDelete);

      // Call the remove function of the service
      const result = await subtasksService.remove(subtaskId);

      expect(subtasksServiceFindOneSpy).toHaveBeenCalledWith(subtaskId);
      expect(subtasksServiceRemoveSpy).toHaveBeenCalledWith(subtaskToDelete);

      expect(result).toStrictEqual(subtaskToDelete);
    });
  });
});
