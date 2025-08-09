import { Injectable, NestMiddleware } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const { method, originalUrl } = req;
    const rawIp = req.ip || req.connection.remoteAddress;
    const ip = rawIp?.replace(/^::ffff:/, '') || '';
    const userAgent = req.headers['user-agent'] || '';
    res.on('finish', () => {
      const statusCode = res.statusCode;
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      console.log(
        `${ip} -  [${now}] "${method} ${statusCode} ${originalUrl} HTTP/${req.httpVersion}" "${userAgent}"`,
      );
    });
    next();
  }
}
