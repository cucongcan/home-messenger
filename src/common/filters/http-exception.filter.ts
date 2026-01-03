import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errorObj = exceptionResponse as any;
        message = errorObj.message || errorObj.error || message;
        code = errorObj.code || errorObj.error || 'HTTP_ERROR';
        
        // Handle array of messages (e.g. from ValidationPipe)
        if (Array.isArray(errorObj.message)) {
            message = errorObj.message.join(', ');
        }
      }
    } else if (exception instanceof Error) {
        message = exception.message;
        code = exception.name; // e.g., 'TypeError', 'ReferenceError'
    }

    const apiResponse: ApiResponse<null> = {
      success: false,
      error: {
        message,
        code,
      },
    };

    response.status(status).json(apiResponse);
  }
}
