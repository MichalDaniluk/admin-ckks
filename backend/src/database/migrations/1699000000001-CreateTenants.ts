import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTenants1699000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE subscription_status_enum AS ENUM (
        'trial',
        'active',
        'suspended',
        'cancelled',
        'expired'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE subscription_plan_enum AS ENUM (
        'starter',
        'professional',
        'enterprise'
      );
    `);

    // Create subscription_plan table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_plan',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'plan_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'plan_code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'max_users',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_courses',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_students',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_monthly',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'price_yearly',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'features',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    // Create tenant table
    await queryRunner.createTable(
      new Table({
        name: 'tenant',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'subscription_plan',
            type: 'subscription_plan_enum',
            default: "'starter'",
          },
          {
            name: 'subscription_status',
            type: 'subscription_status_enum',
            default: "'trial'",
          },
          {
            name: 'max_users',
            type: 'int',
            default: 10,
          },
          {
            name: 'max_courses',
            type: 'int',
            default: 50,
          },
          {
            name: 'max_students',
            type: 'int',
            default: 1000,
          },
          {
            name: 'trial_ends_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'subscription_started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'subscription_ends_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
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
            name: 'country',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'tax_id',
            type: 'varchar',
            length: '50',
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
      'tenant',
      new TableIndex({
        name: 'idx_tenant_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'tenant',
      new TableIndex({
        name: 'idx_tenant_status',
        columnNames: ['subscription_status'],
      }),
    );

    await queryRunner.createIndex(
      'subscription_plan',
      new TableIndex({
        name: 'idx_plan_code',
        columnNames: ['plan_code'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('tenant', 'idx_tenant_slug');
    await queryRunner.dropIndex('tenant', 'idx_tenant_status');
    await queryRunner.dropIndex('subscription_plan', 'idx_plan_code');

    // Drop tables
    await queryRunner.dropTable('tenant');
    await queryRunner.dropTable('subscription_plan');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_plan_enum;`);
  }
}
