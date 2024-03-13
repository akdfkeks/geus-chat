import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntSerializer implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.stringifyBigInt(data)));
  }

  private stringifyBigInt(data: any): any {
    return JSON.parse(JSON.stringify(data, (k, v) => (typeof v === 'bigint' ? v.toString() : v)));
  }
}
