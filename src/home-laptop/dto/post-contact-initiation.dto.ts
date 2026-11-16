import type { Type } from '@nestjs/common';
import { Transform, Type as TransformType } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  ContactInitiationPayloadDto,
  normalizeContactInitiationPayload,
} from './contact-initiation-payload.dto';

export class PostContactInitiationDto {
  @IsOptional()
  @IsString()
  destinationRoute?: string;

  @IsOptional()
  @IsString()
  formId?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeContactInitiationPayload(value))
  @ValidateNested()
  @TransformType(() => ContactInitiationPayloadDto)
  payload?: ContactInitiationPayloadDto;
}