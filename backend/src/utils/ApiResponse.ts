export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data: T | null;

  constructor(statusCode: number, data: T | null, message = 'Success') {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
