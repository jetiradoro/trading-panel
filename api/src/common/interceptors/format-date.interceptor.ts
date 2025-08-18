import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import * as dayjs from 'dayjs';

@Injectable()
export class FormatDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Función recursiva para formatear
        const formatDates = (obj: any) => {
          if (Array.isArray(obj)) {
            return obj.map(formatDates);
          } else if (obj && typeof obj === 'object') {
            const newObj = { ...obj };
            // format dates in the current object
            for (const key in newObj) {
              if (newObj[key] instanceof Date) {
                newObj[key] = dayjs(newObj[key]).format('YYYY-MM-DD HH:mm:ss');
              }
            }

            // Recorremos propiedades anidadas
            Object.keys(newObj).forEach((key) => {
              if (typeof newObj[key] === 'object') {
                newObj[key] = formatDates(newObj[key]);
              }
            });
            return newObj;
          }
          return obj;
        };

        return formatDates(data);
      }),
    );
  }
}
