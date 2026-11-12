import type { Type } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';

const SORT_FIELDS = ['latestHaulCreated'] as const;

export class GetCustomersQueryDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  @IsIn([...SORT_FIELDS])
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
