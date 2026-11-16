import type { Type } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

export class GetSiteNavigationRoutesQueryDto {
  @IsOptional()
  @IsString()
  path?: string;
}