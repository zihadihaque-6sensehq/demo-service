import type { Type } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

function parseAssetIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

export class GetPartnerLogoAssetsQueryDto {
  @Transform(({ value }) => parseAssetIds(value))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assetIds!: string[];

  @IsString()
  @IsNotEmpty()
  format!: string;
}