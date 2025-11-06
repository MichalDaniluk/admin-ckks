import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEnrollments1699000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE enrollment_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
    `);

    await queryRunner.query(`
      CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'partial', 'paid', 'refunded', 'waived');
    `);

    await queryRunner.query(`
      CREATE TYPE attendance_status_enum AS ENUM ('not_started', 'present', 'absent', 'partial');
    `);

    // Create enrollment table
    await queryRunner.createTable(
      new Table({
        name: 'enrollment',
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
            name: 'student_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'course_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'enrollment_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'enrollment_status',
            type: 'enrollment_status_enum',
            default: "'pending'",
          },
          {
            name: 'payment_status',
            type: 'payment_status_enum',
            default: "'unpaid'",
          },
          {
            name: 'attendance_status',
            type: 'attendance_status_enum',
            default: "'not_started'",
          },
          {
            name: 'enrolled_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'confirmed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancellation_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'enrolled_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'enrollment_price',
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
            name: 'amount_paid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'payment_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'payment_reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'attendance_percentage',
            type: 'int',
            default: 0,
          },
          {
            name: 'completion_percentage',
            type: 'int',
            default: 0,
          },
          {
            name: 'final_grade',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'passed',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'certificate_issued',
            type: 'boolean',
            default: false,
          },
          {
            name: 'certificate_issued_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'certificate_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'certificate_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'internal_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'send_notifications',
            type: 'boolean',
            default: true,
          },
          {
            name: 'waitlist_position',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_waitlist',
            type: 'boolean',
            default: false,
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
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_STUDENT',
        columnNames: ['student_id'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_COURSE',
        columnNames: ['course_id'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_SESSION',
        columnNames: ['session_id'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_STATUS',
        columnNames: ['enrollment_status'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_PAYMENT_STATUS',
        columnNames: ['payment_status'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_STUDENT_SESSION',
        columnNames: ['student_id', 'session_id'],
      }),
    );

    await queryRunner.createIndex(
      'enrollment',
      new TableIndex({
        name: 'IDX_ENROLLMENT_CERTIFICATE',
        columnNames: ['certificate_issued'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'enrollment',
      new TableForeignKey({
        name: 'FK_ENROLLMENT_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'enrollment',
      new TableForeignKey({
        name: 'FK_ENROLLMENT_STUDENT',
        columnNames: ['student_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'enrollment',
      new TableForeignKey({
        name: 'FK_ENROLLMENT_COURSE',
        columnNames: ['course_id'],
        referencedTableName: 'course',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'enrollment',
      new TableForeignKey({
        name: 'FK_ENROLLMENT_SESSION',
        columnNames: ['session_id'],
        referencedTableName: 'course_session',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'enrollment',
      new TableForeignKey({
        name: 'FK_ENROLLMENT_ENROLLED_BY',
        columnNames: ['enrolled_by'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Enable RLS on enrollment table
    await queryRunner.query(`
      ALTER TABLE "enrollment" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "enrollment"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "enrollment"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "enrollment";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "enrollment";`);
    await queryRunner.query(`ALTER TABLE "enrollment" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('enrollment', 'FK_ENROLLMENT_ENROLLED_BY');
    await queryRunner.dropForeignKey('enrollment', 'FK_ENROLLMENT_SESSION');
    await queryRunner.dropForeignKey('enrollment', 'FK_ENROLLMENT_COURSE');
    await queryRunner.dropForeignKey('enrollment', 'FK_ENROLLMENT_STUDENT');
    await queryRunner.dropForeignKey('enrollment', 'FK_ENROLLMENT_TENANT');

    // Drop table
    await queryRunner.dropTable('enrollment');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS attendance_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS enrollment_status_enum;`);
  }
}
