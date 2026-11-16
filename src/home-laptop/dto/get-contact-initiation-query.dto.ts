import type { Type } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

export class GetContactInitiationQueryDto {
  @IsOptional()
  @IsString()
  destinationRoute?: string;

  @IsOptional()
  @IsString()
  formId?: string;
}