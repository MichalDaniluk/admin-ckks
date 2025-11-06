import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateLocations1699000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for location type
    await queryRunner.query(`
      CREATE TYPE location_type_enum AS ENUM ('classroom', 'training_room', 'conference_room', 'online', 'external');
    `);

    // Create location table
    await queryRunner.createTable(
      new Table({
        name: 'location',
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
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'location_type_enum',
            default: "'training_room'",
          },
          {
            name: 'description',
            type: 'text',
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
            length: '100',
            isNullable: true,
          },
          {
            name: 'capacity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'has_projector',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_whiteboard',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_computers',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_wifi',
            type: 'boolean',
            default: false,
          },
          {
            name: 'accessibility',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'parking_available',
            type: 'boolean',
            default: false,
          },
          {
            name: 'public_transport',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'contact_person',
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
            name: 'contact_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
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
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'location',
      new TableIndex({
        name: 'idx_location_tenant',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'location',
      new TableIndex({
        name: 'idx_location_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'location',
      new TableIndex({
        name: 'idx_location_city',
        columnNames: ['city'],
      }),
    );

    // Create foreign key to tenant
    await queryRunner.createForeignKey(
      'location',
      new TableForeignKey({
        name: 'fk_location_tenant',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Enable Row-Level Security
    await queryRunner.query(`ALTER TABLE location ENABLE ROW LEVEL SECURITY;`);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY location_tenant_isolation ON location
      USING (tenant_id::text = current_setting('app.current_tenant', true));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('location', 'fk_location_tenant');

    // Drop indexes
    await queryRunner.dropIndex('location', 'idx_location_city');
    await queryRunner.dropIndex('location', 'idx_location_name');
    await queryRunner.dropIndex('location', 'idx_location_tenant');

    // Drop table
    await queryRunner.dropTable('location');

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS location_type_enum;`);
  }
}
