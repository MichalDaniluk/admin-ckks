import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEnrollmentDto } from './create-enrollment.dto';

/**
 * DTO for updating an existing enrollment
 * Omits studentId and sessionId as they shouldn't be changed after creation
 */
export class UpdateEnrollmentDto extends PartialType(
  OmitType(CreateEnrollmentDto, ['studentId', 'sessionId'] as const),
) {}
