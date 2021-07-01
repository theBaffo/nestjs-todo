import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TodosModule } from './todos/todos.module';
import { Todo } from './todos/entities/todo.entity';
import { Subtask } from './todos/entities/subtask.entity';

@Module({
  imports: [
    // Database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      entities: [Todo, Subtask],
      database: 'app.sqlite3',
      synchronize: true,
    }),
    // Modules
    TodosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
