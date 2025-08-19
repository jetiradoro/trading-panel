import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { FormatDateInterceptor } from './common/interceptors/format-date.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new FormatDateInterceptor());
  app.enableCors({
    origin: '*', // Adjust this to your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });
  const config = app.get(ConfigService);
  const port = config.get('app.port');
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
