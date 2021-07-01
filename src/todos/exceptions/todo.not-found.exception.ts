import { HttpStatus, NotFoundException } from '@nestjs/common';

export class TodoNotFoundException extends NotFoundException {
  constructor(id) {
    super(`Todo ${id} not found`, HttpStatus.NOT_FOUND.toString());
  }
}
