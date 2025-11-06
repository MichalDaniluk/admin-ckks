import { PartialType } from '@nestjs/swagger';
import { CreateCourseSessionDto } from './create-course-session.dto';

/**
 * DTO for updating an existing course session
 * All fields are optional - uses PartialType to inherit validations from CreateCourseSessionDto
 */
export class UpdateCourseSessionDto extends PartialType(CreateCourseSessionDto) {}
