import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

/**
 * DTO for updating an existing course
 * All fields are optional - uses PartialType to inherit validations from CreateCourseDto
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
