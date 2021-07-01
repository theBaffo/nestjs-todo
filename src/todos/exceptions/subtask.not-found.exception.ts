import { HttpStatus, NotFoundException } from '@nestjs/common';

export class SubtaskNotFoundException extends NotFoundException {
  constructor(id) {
    super(`Subtask ${id} not found`, HttpStatus.NOT_FOUND.toString());
  }
}
