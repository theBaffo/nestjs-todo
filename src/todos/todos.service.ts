import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodoNotFoundException } from './exceptions/todo.not-found.exception';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  // Utility methods

  async _getTodo(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne(id, {
      relations: ['subtasks'],
    });

    if (!todo) {
      throw new TodoNotFoundException(id);
    }

    return todo;
  }

  // Service methods

  create(createTodoDto: CreateTodoDto): Promise<Todo> {
    // Create empty todo
    const todo = new Todo();

    // Mapping
    todo.title = createTodoDto.title;

    // Create
    return this.todoRepository.save(todo);
  }

  findAll(): Promise<Todo[]> {
    return this.todoRepository.find({ relations: ['subtasks'] });
  }

  findOne(id: string): Promise<Todo> {
    return this._getTodo(id);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    // First, check if todo exists
    const todo = await this._getTodo(id);

    // Update
    return this.todoRepository.save({
      ...todo,
      ...updateTodoDto,
    });
  }

  async remove(id: string): Promise<Todo> {
    // First, check if todo exists
    const todo = await this._getTodo(id);

    // Delete
    await this.todoRepository.remove(todo);

    // Return "copy" of the deleted todo
    return todo;
  }
}
