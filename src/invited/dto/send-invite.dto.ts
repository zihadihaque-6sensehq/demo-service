import type { Type } from '@nestjs/common';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class SendInviteDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
