import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from './entities/subtask.entity';
import { SubtaskNotFoundException } from './exceptions/subtask.not-found.exception';
import { TodosService } from './todos.service';

@Injectable()
export class SubtasksService {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
    @Inject(TodosService)
    private todosService: TodosService,
  ) {}

  // Utility methods

  async _getSubtask(id: string): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne(id);

    if (!subtask) {
      throw new SubtaskNotFoundException(id);
    }

    return subtask;
  }

  // Service methods

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    // First, retrieve the todo by ID
    const todo = await this.todosService.findOne(createSubtaskDto.todoId);

    // Create empty subtask
    const subtask = new Subtask();

    // Mapping
    subtask.title = createSubtaskDto.title;
    subtask.todo = todo;

    // Create
    return this.subtaskRepository.save(subtask);
  }

  findAll(): Promise<Subtask[]> {
    return this.subtaskRepository.find();
  }

  findOne(id: string): Promise<Subtask> {
    return this._getSubtask(id);
  }

  async update(
    id: string,
    updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<Subtask> {
    // First, check if subtask exists
    const subtask = await this._getSubtask(id);

    // Update
    return this.subtaskRepository.save({
      ...subtask,
      ...updateSubtaskDto,
    });
  }

  async remove(id: string): Promise<Subtask> {
    // First, check if subtask exists
    const subtask = await this._getSubtask(id);

    // Delete
    await this.subtaskRepository.remove(subtask);

    // Return "copy" of the deleted subtask
    return subtask;
  }
}
