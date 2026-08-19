export class ApiResponse<T = unknown> {
    constructor(
      public success: boolean,
      public message: string,
      public data?: T
    ) {}
  
    static success<T>(message: string, data?: T) {
      return new ApiResponse<T>(true, message, data);
    }
  
    static error(message: string, data?: unknown) {
      return new ApiResponse(false, message, data);
    }
  }