export class ApiResponse<T> {
  constructor(public timestamp: number | string, data: T[], type: string) {
    this[type] = data;
  }
}
