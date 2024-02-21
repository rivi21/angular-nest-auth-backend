import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import * as brcryptjs from 'bcryptjs';

import { CreateUserDto, LoginDto, RegisterDto, UpdateAuthDto } from './dto/index.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Para grabar en base datos: (1)-usamos nuestro modelo, (2)-le enviamos la data y (3)-lo guardamos
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // obtenemos la contraseña con desestructuración
      const { password, ...userData } = createUserDto;

      /*(1)*/
      const newUser = new this.userModel(
        /*(2)*/ {
          password: brcryptjs.hashSync(password, 10), // 1- encriptamos la contraseña
          ...userData,
        },
      );

      // 2- Guardamos el usuario
      await newUser.save(); /*(3)*/
      const { password: _, ...user } = newUser.toJSON(); // Excluimos la contraseña de la respuesta
      // ponemos de nombre _ xq ya tenemos otra variable llamada password. Para que no choquen.

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists`);
      }
      throw new InternalServerErrorException(`Something terrible happen!!!`);
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // Registramos al nuevo usuario
    const user = await this.create(registerDto);
    // Hacemos el login del usuario para tener el token

    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Debe retornar el usuario y el token de acceso
    const { email, password } = loginDto; // desestructuramos las propiedades que nos interesan

    // Validación del email
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    // Validación de la contraseña
    if (!brcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    // Para retornar el usuario(sin password) y el token de acceso usamos tb la desestructuración
    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON(); //toJSON para asegurarnos que no nos manda las funciones que tiene propias ese modelo, ya que no me interesan.
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  checkToken(token: string) {}
}
