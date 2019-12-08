export class ApiResponse<T> {
  constructor(public timestamp: number, data: T[], type: string) {
    this[type] = data;
  }
}
