import type { Type } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

export class ExportCustomersDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  activity?: string;
}
