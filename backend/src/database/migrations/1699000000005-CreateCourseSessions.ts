import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCourseSessions1699000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE session_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
    `);

    await queryRunner.query(`
      CREATE TYPE session_type_enum AS ENUM ('online', 'in_person', 'hybrid');
    `);

    // Create course_session table
    await queryRunner.createTable(
      new Table({
        name: 'course_session',
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
            name: 'course_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'session_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'session_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'session_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'session_status',
            type: 'session_status_enum',
            default: "'scheduled'",
          },
          {
            name: 'session_type',
            type: 'session_type_enum',
            default: "'in_person'",
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'registration_deadline',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'online_meeting_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'online_meeting_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'online_meeting_password',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'instructor_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'instructor_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'instructor_phone',
            type: 'varchar',
            length: '50',
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
            default: 1,
          },
          {
            name: 'current_participants',
            type: 'int',
            default: 0,
          },
          {
            name: 'session_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'PLN'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_registration_open',
            type: 'boolean',
            default: true,
          },
          {
            name: 'send_reminders',
            type: 'boolean',
            default: true,
          },
          {
            name: 'reminder_days_before',
            type: 'int',
            default: 7,
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
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_COURSE',
        columnNames: ['course_id'],
      }),
    );

    await queryRunner.createIndex(
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_STATUS',
        columnNames: ['session_status'],
      }),
    );

    await queryRunner.createIndex(
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_START_DATE',
        columnNames: ['start_date'],
      }),
    );

    await queryRunner.createIndex(
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_END_DATE',
        columnNames: ['end_date'],
      }),
    );

    await queryRunner.createIndex(
      'course_session',
      new TableIndex({
        name: 'IDX_SESSION_REGISTRATION_OPEN',
        columnNames: ['is_registration_open'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'course_session',
      new TableForeignKey({
        name: 'FK_SESSION_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'course_session',
      new TableForeignKey({
        name: 'FK_SESSION_COURSE',
        columnNames: ['course_id'],
        referencedTableName: 'course',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Enable RLS on course_session table
    await queryRunner.query(`
      ALTER TABLE "course_session" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "course_session"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "course_session"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "course_session";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "course_session";`);
    await queryRunner.query(`ALTER TABLE "course_session" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('course_session', 'FK_SESSION_COURSE');
    await queryRunner.dropForeignKey('course_session', 'FK_SESSION_TENANT');

    // Drop table
    await queryRunner.dropTable('course_session');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS session_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS session_status_enum;`);
  }
}
