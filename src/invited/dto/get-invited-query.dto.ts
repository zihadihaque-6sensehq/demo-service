import type { Type } from '@nestjs/common';
import { Type as TransformType } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetInvitedQueryDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @TransformType(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @TransformType(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
