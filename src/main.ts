import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Set global prefix as a static path
    app.setGlobalPrefix('api/v1', { exclude: ['/'] }); // Exclude root path if needed
    
    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('BAZARAPI')
        .setDescription('Ceci est la description de bazarapi')
        .setVersion('1.0')
        .addTag('home')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Swagger endpoint at /api

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();