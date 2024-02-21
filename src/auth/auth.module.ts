import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Como estoy en otro módulo necesito acceso a las variables de entorno, que ya están configuradas pero en el momento que este módulo se crea, todavía no están puestas y x eso llamamos aquí tb al ConfigModule
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
