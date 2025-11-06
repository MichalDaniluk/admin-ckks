import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePaymentTable1762355000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE payment_type_enum AS ENUM ('payment', 'refund', 'adjustment');
    `);

    await queryRunner.query(`
      CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'online', 'other');
    `);

    // Create payment table
    await queryRunner.createTable(
      new Table({
        name: 'payment',
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
            name: 'enrollment_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'payment_type',
            type: 'payment_type_enum',
            default: "'payment'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'PLN'",
          },
          {
            name: 'payment_method',
            type: 'payment_method_enum',
            default: "'cash'",
          },
          {
            name: 'payment_date',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'reference_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'processed_by',
            type: 'uuid',
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
      'payment',
      new TableIndex({
        name: 'IDX_PAYMENT_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment',
      new TableIndex({
        name: 'IDX_PAYMENT_ENROLLMENT',
        columnNames: ['enrollment_id'],
      }),
    );

    await queryRunner.createIndex(
      'payment',
      new TableIndex({
        name: 'IDX_PAYMENT_TYPE',
        columnNames: ['payment_type'],
      }),
    );

    await queryRunner.createIndex(
      'payment',
      new TableIndex({
        name: 'IDX_PAYMENT_DATE',
        columnNames: ['payment_date'],
      }),
    );

    await queryRunner.createIndex(
      'payment',
      new TableIndex({
        name: 'IDX_PAYMENT_PROCESSED_BY',
        columnNames: ['processed_by'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'payment',
      new TableForeignKey({
        name: 'FK_PAYMENT_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payment',
      new TableForeignKey({
        name: 'FK_PAYMENT_ENROLLMENT',
        columnNames: ['enrollment_id'],
        referencedTableName: 'enrollment',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payment',
      new TableForeignKey({
        name: 'FK_PAYMENT_PROCESSED_BY',
        columnNames: ['processed_by'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Enable RLS on payment table
    await queryRunner.query(`
      ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "payment"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "payment"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "payment";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "payment";`);
    await queryRunner.query(`ALTER TABLE "payment" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('payment', 'FK_PAYMENT_PROCESSED_BY');
    await queryRunner.dropForeignKey('payment', 'FK_PAYMENT_ENROLLMENT');
    await queryRunner.dropForeignKey('payment', 'FK_PAYMENT_TENANT');

    // Drop table
    await queryRunner.dropTable('payment');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_type_enum;`);
  }
}
