import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { SubtaskStatus } from './subtask-status';
import { Todo } from './todo.entity';

@Entity()
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'simple-enum',
    enum: SubtaskStatus,
    default: SubtaskStatus.PENDING,
  })
  status: SubtaskStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Todo, (todo) => todo.subtasks)
  todo: Todo;
}
