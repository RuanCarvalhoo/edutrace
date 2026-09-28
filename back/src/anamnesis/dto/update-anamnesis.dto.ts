import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAnamnesisDto } from './create-anamnesis.dto';

export class UpdateAnamnesisDto extends PartialType(
  OmitType(CreateAnamnesisDto, ['email'] as const),
) {}
