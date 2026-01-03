import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from '@vendors/adapters/redis-io.adapter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip away non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Home Media Hub API')
    .setDescription('The Home Media Hub API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
