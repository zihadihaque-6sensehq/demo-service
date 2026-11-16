import type { Type } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetMarketingContentBundleQueryDto {
  @IsString()
  @IsNotEmpty()
  locale!: string;

  @IsString()
  @IsNotEmpty()
  pageKey!: string;
}