import { IsEnum } from 'class-validator';
import { SubtaskStatus } from '../entities/subtask-status';

export class UpdateSubtaskDto {
  @IsEnum(SubtaskStatus)
  status: SubtaskStatus;
}
