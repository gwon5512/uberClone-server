import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() { // bootstrap 통해 전체 애플리케이션에서 사용가능 (cf 부분적용/제외는 app.module.ts에서)
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
}
bootstrap();

// repository / class / dependcy injection을 사용 할 때 Middleware 를 app.use() 에 넣을 수 없다.
// middleware 를 어디서든지 사용하고 싶다면 functional middleware.. class middleware 사용은 app.module 에서