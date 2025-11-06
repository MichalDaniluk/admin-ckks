import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTimeEntryTable1762354000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE time_entry_status_enum AS ENUM ('draft', 'submitted', 'approved', 'rejected');
    `);

    await queryRunner.query(`
      CREATE TYPE time_entry_type_enum AS ENUM ('work', 'overtime', 'break', 'meeting', 'training', 'other');
    `);

    // Create time_entry table
    await queryRunner.createTable(
      new Table({
        name: 'time_entry',
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
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'entry_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'entry_type',
            type: 'time_entry_type_enum',
            default: "'work'",
          },
          {
            name: 'entry_status',
            type: 'time_entry_status_enum',
            default: "'draft'",
          },
          {
            name: 'project_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'task_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_billable',
            type: 'boolean',
            default: true,
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'text',
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
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_USER',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_DATE',
        columnNames: ['entry_date'],
      }),
    );

    await queryRunner.createIndex(
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_STATUS',
        columnNames: ['entry_status'],
      }),
    );

    await queryRunner.createIndex(
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_USER_DATE',
        columnNames: ['user_id', 'entry_date'],
      }),
    );

    await queryRunner.createIndex(
      'time_entry',
      new TableIndex({
        name: 'IDX_TIME_ENTRY_TYPE',
        columnNames: ['entry_type'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'time_entry',
      new TableForeignKey({
        name: 'FK_TIME_ENTRY_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'time_entry',
      new TableForeignKey({
        name: 'FK_TIME_ENTRY_USER',
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'time_entry',
      new TableForeignKey({
        name: 'FK_TIME_ENTRY_APPROVER',
        columnNames: ['approved_by'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Enable RLS on time_entry table
    await queryRunner.query(`
      ALTER TABLE "time_entry" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "time_entry"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "time_entry"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "time_entry";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "time_entry";`);
    await queryRunner.query(`ALTER TABLE "time_entry" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('time_entry', 'FK_TIME_ENTRY_APPROVER');
    await queryRunner.dropForeignKey('time_entry', 'FK_TIME_ENTRY_USER');
    await queryRunner.dropForeignKey('time_entry', 'FK_TIME_ENTRY_TENANT');

    // Drop table
    await queryRunner.dropTable('time_entry');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS time_entry_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS time_entry_status_enum;`);
  }
}
