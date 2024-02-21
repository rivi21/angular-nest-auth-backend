import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  _id?: string; //lo crea mongo

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ minLength: 6, required: true })
  password?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// NOTA: Hay que crear la clase de la entidad con el decorador @Schema y después
// exportarlo a la db.
