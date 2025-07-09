import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserSignInDto {
  @ApiProperty({ description: 'Email de l\'utilisateur pour se connecter' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  email: string;

  @ApiProperty({ description: 'Mot de passe de l\'utilisateur pour se connecter' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @MinLength(5, { message: 'Password minimul character should be 5.' })
  password: string;
}
