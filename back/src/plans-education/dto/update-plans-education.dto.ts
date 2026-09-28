import { PartialType } from '@nestjs/swagger';
import { CreatePlansEducationDto } from './create-plans-education.dto';

export class UpdatePlansEducationDto extends PartialType(
  CreatePlansEducationDto,
) {}
