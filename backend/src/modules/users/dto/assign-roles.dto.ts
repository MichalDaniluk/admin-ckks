import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({
    example: ['role-uuid-1', 'role-uuid-2'],
    description: 'Array of role IDs to assign to user',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
