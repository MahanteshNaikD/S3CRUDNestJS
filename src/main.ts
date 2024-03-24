import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule, ApiBearerAuth } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('AWS S3 CRUD OPERATION')
    .setDescription('TASK BY JK TECH')
    .addTag('All Routes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('file', app, document);
  await app.listen(3005);
}
bootstrap();
