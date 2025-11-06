import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCourses1699000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE course_status_enum AS ENUM ('draft', 'published', 'archived');
    `);

    await queryRunner.query(`
      CREATE TYPE course_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');
    `);

    // Create course table
    await queryRunner.createTable(
      new Table({
        name: 'course',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'course_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'course_title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'course_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'short_description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'course_status',
            type: 'course_status_enum',
            default: "'draft'",
          },
          {
            name: 'course_level',
            type: 'course_level_enum',
            default: "'all_levels'",
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'PLN'",
          },
          {
            name: 'duration_hours',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'duration_days',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'max_participants',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'min_participants',
            type: 'int',
            isNullable: true,
            default: 1,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'thumbnail_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'syllabus',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'prerequisites',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'learning_objectives',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_featured',
            type: 'boolean',
            default: false,
          },
          {
            name: 'certification_provided',
            type: 'boolean',
            default: false,
          },
          {
            name: 'certificate_template',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'course',
      new TableIndex({
        name: 'IDX_COURSE_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'course',
      new TableIndex({
        name: 'IDX_COURSE_STATUS',
        columnNames: ['course_status'],
      }),
    );

    await queryRunner.createIndex(
      'course',
      new TableIndex({
        name: 'IDX_COURSE_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'course',
      new TableIndex({
        name: 'IDX_COURSE_FEATURED',
        columnNames: ['is_featured'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'course',
      new TableForeignKey({
        name: 'FK_COURSE_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Enable RLS on course table
    await queryRunner.query(`
      ALTER TABLE "course" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "course"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "course"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "course";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "course";`);
    await queryRunner.query(`ALTER TABLE "course" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign key
    await queryRunner.dropForeignKey('course', 'FK_COURSE_TENANT');

    // Drop table
    await queryRunner.dropTable('course');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS course_level_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS course_status_enum;`);
  }
}
