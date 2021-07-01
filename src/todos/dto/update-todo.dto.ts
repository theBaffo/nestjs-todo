import { IsEnum } from 'class-validator';
import { TodoStatus } from '../entities/todo-status';

export class UpdateTodoDto {
  @IsEnum(TodoStatus)
  status: TodoStatus;
}
