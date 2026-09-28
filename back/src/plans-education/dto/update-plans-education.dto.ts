import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlansEducationDto } from './create-plans-education.dto';

export class UpdatePlansEducationDto extends PartialType(
  OmitType(CreatePlansEducationDto, ['student_email'] as const),
) {}
