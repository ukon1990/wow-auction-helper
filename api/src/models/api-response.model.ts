export class ApiResponse<T> {
  constructor(public timestamp: number | string, data: T[] | T, type: string) {
    this[type] = data;
  }
}
