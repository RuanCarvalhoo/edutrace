import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateScreeningDto } from './create-screening.dto';

export class UpdateScreeningDto extends PartialType(
  OmitType(CreateScreeningDto, ['email'] as const),
) {}
