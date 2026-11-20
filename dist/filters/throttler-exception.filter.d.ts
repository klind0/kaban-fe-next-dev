import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
declare module '@nestjs/throttler' {
    interface ThrottlerException {
        getHeaders?(): Record<string, string | number>;
    }
}
export declare class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost): void;
}
