import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUsers1699000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create permission table
    await queryRunner.createTable(
      new Table({
        name: 'permission',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'permission_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'permission_code',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'module',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
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

    // Create role table
    await queryRunner.createTable(
      new Table({
        name: 'role',
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
            isNullable: true, // NULL for system roles
          },
          {
            name: 'role_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_system_role',
            type: 'boolean',
            default: false,
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

    // Create user table
    await queryRunner.createTable(
      new Table({
        name: 'user',
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
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verification_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reset_password_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reset_password_expires',
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

    // Create user_role join table
    await queryRunner.createTable(
      new Table({
        name: 'user_role',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create role_permission join table
    await queryRunner.createTable(
      new Table({
        name: 'role_permission',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'permission_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create user_session table
    await queryRunner.createTable(
      new Table({
        name: 'user_session',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'device_info',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'is_revoked',
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
      'permission',
      new TableIndex({
        name: 'idx_permission_code',
        columnNames: ['permission_code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'permission',
      new TableIndex({
        name: 'idx_permission_module',
        columnNames: ['module'],
      }),
    );

    await queryRunner.createIndex(
      'role',
      new TableIndex({
        name: 'idx_role_tenant',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'role',
      new TableIndex({
        name: 'idx_role_code',
        columnNames: ['code'],
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_tenant',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'idx_user_tenant_email',
        columnNames: ['tenant_id', 'email'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user_role',
      new TableIndex({
        name: 'idx_user_role_unique',
        columnNames: ['user_id', 'role_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'role_permission',
      new TableIndex({
        name: 'idx_role_permission_unique',
        columnNames: ['role_id', 'permission_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user_session',
      new TableIndex({
        name: 'idx_session_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_session',
      new TableIndex({
        name: 'idx_session_token',
        columnNames: ['refresh_token'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'role',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_role',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_role',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'role',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'role',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permission',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_session',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const userSessionTable = await queryRunner.getTable('user_session');
    const userSessionFk = userSessionTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (userSessionFk) {
      await queryRunner.dropForeignKey('user_session', userSessionFk);
    }

    const rolePermissionTable = await queryRunner.getTable('role_permission');
    const rolePermissionFks = rolePermissionTable.foreignKeys;
    for (const fk of rolePermissionFks) {
      await queryRunner.dropForeignKey('role_permission', fk);
    }

    const userRoleTable = await queryRunner.getTable('user_role');
    const userRoleFks = userRoleTable.foreignKeys;
    for (const fk of userRoleFks) {
      await queryRunner.dropForeignKey('user_role', fk);
    }

    const userTable = await queryRunner.getTable('user');
    const userFk = userTable.foreignKeys.find(fk => fk.columnNames.indexOf('tenant_id') !== -1);
    if (userFk) {
      await queryRunner.dropForeignKey('user', userFk);
    }

    const roleTable = await queryRunner.getTable('role');
    const roleFk = roleTable.foreignKeys.find(fk => fk.columnNames.indexOf('tenant_id') !== -1);
    if (roleFk) {
      await queryRunner.dropForeignKey('role', roleFk);
    }

    // Drop tables
    await queryRunner.dropTable('user_session');
    await queryRunner.dropTable('role_permission');
    await queryRunner.dropTable('user_role');
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('role');
    await queryRunner.dropTable('permission');
  }
}
