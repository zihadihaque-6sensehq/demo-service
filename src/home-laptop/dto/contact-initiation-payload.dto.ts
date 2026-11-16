import { BadRequestException } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const ALLOWED_CONTACT_PAYLOAD_KEYS = new Set(['name', 'email']);

const CONTACT_EMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function sanitizeContactInputString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  return value.replace(CONTROL_CHAR_PATTERN, '').trim();
}

export function normalizeContactInitiationPayload(
  value: unknown,
): ContactInitiationPayloadDto | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException({
      message: 'Validation failed: payload must be an object',
      userVisibleError:
        'Contact form data is invalid. Please complete the form and try again.',
    });
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_CONTACT_PAYLOAD_KEYS.has(key)) {
      throw new BadRequestException({
        message: `Validation failed: unexpected contact payload field "${key}"`,
        userVisibleError:
          'Contact form contains invalid fields. Please review your submission.',
      });
    }
  }

  const normalized: ContactInitiationPayloadDto = {};

  if (record.name !== undefined) {
    if (typeof record.name !== 'string') {
      throw new BadRequestException({
        message: 'Validation failed: payload.name must be a string',
        userVisibleError: 'Please enter your name before submitting.',
      });
    }
    const name = sanitizeContactInputString(record.name);
    if (!name) {
      throw new BadRequestException({
        message: 'Validation failed: payload.name must be a non-empty string',
        userVisibleError: 'Please enter your name before submitting.',
      });
    }
    if (name.length > 200) {
      throw new BadRequestException({
        message: 'Validation failed: payload.name exceeds maximum length',
        userVisibleError: 'Please shorten your name and try again.',
      });
    }
    normalized.name = name;
  }

  if (record.email !== undefined) {
    if (typeof record.email !== 'string') {
      throw new BadRequestException({
        message: 'Validation failed: payload.email must be a string',
        userVisibleError:
          'Please enter a valid email address before submitting.',
      });
    }
    const email = sanitizeContactInputString(record.email)?.toLowerCase();
    if (!email || !CONTACT_EMAIL_PATTERN.test(email)) {
      throw new BadRequestException({
        message: 'Validation failed: payload.email must be a valid email address',
        userVisibleError:
          'Please enter a valid email address before submitting.',
      });
    }
    if (email.length > 254) {
      throw new BadRequestException({
        message: 'Validation failed: payload.email exceeds maximum length',
        userVisibleError:
          'Please enter a valid email address before submitting.',
      });
    }
    normalized.email = email;
  }

  return normalized;
}

export class ContactInitiationPayloadDto {
  @IsOptional()
  @Transform(({ value }) => sanitizeContactInputString(value))
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const sanitized = sanitizeContactInputString(value);
    return sanitized === undefined ? undefined : sanitized.toLowerCase();
  })
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email?: string;
}