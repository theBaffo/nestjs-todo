import { Test } from '@nestjs/testing';
import { Subtask } from './entities/subtask.entity';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { SubtaskStatus } from './entities/subtask-status';

import * as faker from 'faker';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubtaskRepositoryFake } from './mocks/subtasks.repository.fake';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Todo } from './entities/todo.entity';
import { TodoStatus } from './entities/todo-status';
import { TodosService } from './todos.service';
import { TodoRepositoryFake } from './mocks/todos.repository.fake';

describe('SubtasksController', () => {
  let subtasksController: SubtasksController;
  let subtasksService: SubtasksService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SubtasksController],
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

    subtasksService = moduleRef.get<SubtasksService>(SubtasksService);
    subtasksController = moduleRef.get<SubtasksController>(SubtasksController);
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

      // Mock the result of the save function
      const subtasksServiceCreateSpy = jest
        .spyOn(subtasksService, 'create')
        .mockResolvedValue(subtask);

      // Call the create function of the service
      const createSubtaskDto = new CreateSubtaskDto();
      createSubtaskDto.title = title;
      createSubtaskDto.todoId = todoId;

      const result = await subtasksController.create(createSubtaskDto);

      // Assert result
      expect(subtasksServiceCreateSpy).toBeCalledWith(createSubtaskDto);
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

      // Creates a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToRead = new Subtask();
      subtaskToRead.id = subtaskId;
      subtaskToRead.title = faker.lorem.sentence();
      subtaskToRead.status = SubtaskStatus.PENDING;
      subtaskToRead.createdAt = new Date();
      subtaskToRead.updatedAt = new Date();
      subtaskToRead.todo = todo;

      const subtasksServiceFindOneSpy = jest
        .spyOn(subtasksService, 'findOne')
        .mockResolvedValue(subtaskToRead);

      // Call the remove function of the service
      const result = await subtasksController.findOne(subtaskId);

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

      const subtasksServiceFindAllSpy = jest
        .spyOn(subtasksService, 'findAll')
        .mockResolvedValue([subtaskToRead]);

      // Call the remove function of the service
      const result = await subtasksController.findAll();

      expect(subtasksServiceFindAllSpy).toHaveBeenCalled();
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

      // Creates a subtask
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

      const subtasksServiceUpdateSpy = jest
        .spyOn(subtasksService, 'update')
        .mockResolvedValue(updatedSubtask);

      // Call the update function of the service
      const updateSubtaskDto = new UpdateSubtaskDto();
      updateSubtaskDto.status = SubtaskStatus.COMPLETED;

      const result = await subtasksController.update(
        subtaskId,
        updateSubtaskDto,
      );

      expect(subtasksServiceUpdateSpy).toHaveBeenCalledWith(
        subtaskId,
        updateSubtaskDto,
      );
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

      // Creates a subtask
      const subtaskId = faker.datatype.uuid();

      const subtaskToDelete = new Subtask();
      subtaskToDelete.id = subtaskId;
      subtaskToDelete.title = faker.lorem.sentence();
      subtaskToDelete.status = SubtaskStatus.PENDING;
      subtaskToDelete.createdAt = new Date();
      subtaskToDelete.updatedAt = new Date();
      subtaskToDelete.todo = todo;

      const subtasksServiceRemoveSpy = jest
        .spyOn(subtasksService, 'remove')
        .mockResolvedValue(subtaskToDelete);

      // Call the remove function of the service
      const result = await subtasksController.remove(subtaskId);

      expect(subtasksServiceRemoveSpy).toHaveBeenCalledWith(subtaskId);
      expect(result).toStrictEqual(subtaskToDelete);
    });
  });
});
