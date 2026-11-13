import type { Type } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

export class GetCustomerFiltersQueryDto {
  @IsOptional()
  @IsString()
  state?: string;
}
