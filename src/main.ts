import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    app.setGlobalPrefix('api/v1')

    // Configuration de Swagger
    const config = new DocumentBuilder()
        .setTitle('BAZARAPI')
        .setDescription('Ceci est la description de bazarapi')
        .setVersion('1.0')
        .addTag('home') // Optionnel : ajoute des tags pour organiser
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document) // 'api' est le chemin pour accéder à Swagger (ex. : http://localhost:3000/api)

    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
