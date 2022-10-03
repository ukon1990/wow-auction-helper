export class UpdateProgressModel {
  successful = 0;
  completed = 0;

  constructor(public key: string, public total: number) {
  }

  addSuccessful(): void {
    this.successful++;
  }
  addCompleted(): void {
    this.completed++;
  }
}