import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  todoId: string;
}
