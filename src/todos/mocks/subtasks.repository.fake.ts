export class SubtaskRepositoryFake {
  public create(): void {
    return;
  }

  public async save(): Promise<void> {
    return Promise.resolve();
  }

  public async remove(): Promise<void> {
    return Promise.resolve();
  }

  public async findOne(): Promise<void> {
    return Promise.resolve();
  }

  public async find(): Promise<void> {
    return Promise.resolve();
  }
}
