import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsAndSuperAdminRole1762356000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert permissions for all modules
    await queryRunner.query(`
      INSERT INTO permission (permission_name, permission_code, module, description) VALUES
      -- Courses permissions
      ('View Courses', 'courses:view', 'courses', 'View courses list and details'),
      ('Create Course', 'courses:create', 'courses', 'Create new courses'),
      ('Update Course', 'courses:update', 'courses', 'Update existing courses'),
      ('Delete Course', 'courses:delete', 'courses', 'Delete courses'),
      ('Publish Course', 'courses:publish', 'courses', 'Publish/unpublish courses'),

      -- Sessions permissions
      ('View Sessions', 'sessions:view', 'sessions', 'View course sessions'),
      ('Create Session', 'sessions:create', 'sessions', 'Create course sessions'),
      ('Update Session', 'sessions:update', 'sessions', 'Update course sessions'),
      ('Delete Session', 'sessions:delete', 'sessions', 'Delete course sessions'),
      ('Manage Session Status', 'sessions:manage-status', 'sessions', 'Start/complete/cancel sessions'),

      -- Enrollments permissions
      ('View Enrollments', 'enrollments:view', 'enrollments', 'View enrollments'),
      ('Create Enrollment', 'enrollments:create', 'enrollments', 'Create new enrollments'),
      ('Update Enrollment', 'enrollments:update', 'enrollments', 'Update enrollments'),
      ('Delete Enrollment', 'enrollments:delete', 'enrollments', 'Delete enrollments'),
      ('Manage Enrollment Status', 'enrollments:manage-status', 'enrollments', 'Confirm/cancel/complete enrollments'),
      ('Issue Certificate', 'enrollments:certificate', 'enrollments', 'Issue certificates to students'),

      -- Students permissions
      ('View Students', 'students:view', 'students', 'View students list'),
      ('Create Student', 'students:create', 'students', 'Create new students'),
      ('Update Student', 'students:update', 'students', 'Update student information'),
      ('Delete Student', 'students:delete', 'students', 'Delete students'),

      -- Users permissions
      ('View Users', 'users:view', 'users', 'View users list'),
      ('Create User', 'users:create', 'users', 'Create new users'),
      ('Update User', 'users:update', 'users', 'Update user information'),
      ('Delete User', 'users:delete', 'users', 'Delete users'),
      ('Manage User Roles', 'users:manage-roles', 'users', 'Assign/remove user roles'),
      ('Activate/Deactivate User', 'users:manage-status', 'users', 'Activate or deactivate users'),

      -- Instructors permissions
      ('View Instructors', 'instructors:view', 'instructors', 'View instructors list'),
      ('Create Instructor', 'instructors:create', 'instructors', 'Create new instructors'),
      ('Update Instructor', 'instructors:update', 'instructors', 'Update instructor information'),
      ('Delete Instructor', 'instructors:delete', 'instructors', 'Delete instructors'),

      -- Locations permissions
      ('View Locations', 'locations:view', 'locations', 'View locations list'),
      ('Create Location', 'locations:create', 'locations', 'Create new locations'),
      ('Update Location', 'locations:update', 'locations', 'Update location information'),
      ('Delete Location', 'locations:delete', 'locations', 'Delete locations'),

      -- Payments permissions
      ('View Payments', 'payments:view', 'payments', 'View payment records'),
      ('Create Payment', 'payments:create', 'payments', 'Record new payments'),
      ('Update Payment', 'payments:update', 'payments', 'Update payment records'),
      ('Delete Payment', 'payments:delete', 'payments', 'Delete payment records'),
      ('Issue Refund', 'payments:refund', 'payments', 'Issue refunds'),

      -- Time Tracking permissions
      ('View Time Entries', 'time-tracking:view', 'time-tracking', 'View time entries'),
      ('Create Time Entry', 'time-tracking:create', 'time-tracking', 'Create time entries'),
      ('Update Time Entry', 'time-tracking:update', 'time-tracking', 'Update time entries'),
      ('Delete Time Entry', 'time-tracking:delete', 'time-tracking', 'Delete time entries'),
      ('Approve Time Entry', 'time-tracking:approve', 'time-tracking', 'Approve time entries'),
      ('Reject Time Entry', 'time-tracking:reject', 'time-tracking', 'Reject time entries'),

      -- Dashboard permissions
      ('View Dashboard', 'dashboard:view', 'dashboard', 'View dashboard statistics'),

      -- Reports permissions
      ('View Reports', 'reports:view', 'reports', 'View reports'),
      ('Export Data', 'reports:export', 'reports', 'Export data to files'),

      -- Tenant Management (SUPER_ADMIN only)
      ('View Tenants', 'tenants:view', 'tenants', 'View all tenants'),
      ('Create Tenant', 'tenants:create', 'tenants', 'Create new tenants'),
      ('Update Tenant', 'tenants:update', 'tenants', 'Update tenant information'),
      ('Delete Tenant', 'tenants:delete', 'tenants', 'Delete tenants'),
      ('Manage Tenant Subscription', 'tenants:manage-subscription', 'tenants', 'Manage tenant subscriptions'),
      ('View Tenant Usage', 'tenants:view-usage', 'tenants', 'View tenant usage statistics');
    `);

    // 2. Create SUPER_ADMIN role (without tenant_id - system-wide role) - only if doesn't exist
    const existingSuperAdmin = await queryRunner.query(`
      SELECT id FROM role WHERE code = 'SUPER_ADMIN' AND tenant_id IS NULL LIMIT 1
    `);

    if (existingSuperAdmin.length === 0) {
      await queryRunner.query(`
        INSERT INTO role (role_name, code, description, is_system_role, is_active, tenant_id)
        VALUES ('Super Administrator', 'SUPER_ADMIN', 'System administrator with full access to all tenants and system features', true, true, NULL);
      `);
    }

    // 3. Get all permission IDs
    const permissions = await queryRunner.query(`SELECT id, permission_code FROM permission`);

    // 4. Get SUPER_ADMIN role ID
    const superAdminRole = await queryRunner.query(`
      SELECT id FROM role WHERE code = 'SUPER_ADMIN' AND tenant_id IS NULL LIMIT 1
    `);

    // 5. Get all TENANT_ADMIN roles
    const tenantAdminRoles = await queryRunner.query(`
      SELECT id FROM role WHERE code = 'TENANT_ADMIN'
    `);

    // 6. Assign ALL permissions to SUPER_ADMIN
    if (superAdminRole.length > 0) {
      const superAdminRoleId = superAdminRole[0].id;
      for (const permission of permissions) {
        await queryRunner.query(`
          INSERT INTO role_permission (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [superAdminRoleId, permission.id]);
      }
    }

    // 7. Assign tenant-level permissions to TENANT_ADMIN (exclude tenant management permissions)
    const tenantPermissions = permissions.filter((p: any) => !p.permission_code.startsWith('tenants:'));

    for (const tenantAdminRole of tenantAdminRoles) {
      for (const permission of tenantPermissions) {
        await queryRunner.query(`
          INSERT INTO role_permission (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [tenantAdminRole.id, permission.id]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove role_permission relationships
    await queryRunner.query(`DELETE FROM role_permission`);

    // Remove SUPER_ADMIN role
    await queryRunner.query(`DELETE FROM role WHERE code = 'SUPER_ADMIN' AND tenant_id IS NULL`);

    // Remove all permissions
    await queryRunner.query(`DELETE FROM permission`);
  }
}
