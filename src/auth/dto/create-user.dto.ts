// En el Dto ponemos las propiedades necesarias para crear un registro en una colección(tabla). Aquellas que no puedo saber yo.

import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @MinLength(6)
  password: string;
}
