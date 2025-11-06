import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRowLevelSecurity1699000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable Row-Level Security on tenant-isolated tables

    // 1. Enable RLS on user table
    await queryRunner.query(`
      ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
    `);

    // Create policy for user table
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "user"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy to allow Super Admin to bypass RLS
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "user"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);

    // 2. Enable RLS on role table (only for tenant-specific roles)
    await queryRunner.query(`
      ALTER TABLE "role" ENABLE ROW LEVEL SECURITY;
    `);

    // Create policy for role table (allow system roles + tenant-specific roles)
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "role"
      USING (
        tenant_id IS NULL OR
        tenant_id::text = current_setting('app.current_tenant', true)
      )
      WITH CHECK (
        tenant_id IS NULL OR
        tenant_id::text = current_setting('app.current_tenant', true)
      );
    `);

    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "role"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);

    // 3. Enable RLS on user_session table
    await queryRunner.query(`
      ALTER TABLE "user_session" ENABLE ROW LEVEL SECURITY;
    `);

    // Create policy for user_session (join with user to get tenant_id)
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "user_session"
      USING (
        EXISTS (
          SELECT 1 FROM "user"
          WHERE "user".id = "user_session".user_id
          AND "user".tenant_id::text = current_setting('app.current_tenant', true)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "user"
          WHERE "user".id = "user_session".user_id
          AND "user".tenant_id::text = current_setting('app.current_tenant', true)
        )
      );
    `);

    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "user_session"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);

    // Create helper function to set tenant context
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create helper function to clear tenant context
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION clear_tenant_context()
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_tenant', '', false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create helper function to enable Super Admin mode
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION enable_super_admin_mode()
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.bypass_rls', 'true', false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create helper function to disable Super Admin mode
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION disable_super_admin_mode()
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.bypass_rls', 'false', false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop helper functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS disable_super_admin_mode();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS enable_super_admin_mode();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS clear_tenant_context();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_tenant_context(uuid);`);

    // Drop policies and disable RLS on user_session
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "user_session";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "user_session";`);
    await queryRunner.query(`ALTER TABLE "user_session" DISABLE ROW LEVEL SECURITY;`);

    // Drop policies and disable RLS on role
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "role";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "role";`);
    await queryRunner.query(`ALTER TABLE "role" DISABLE ROW LEVEL SECURITY;`);

    // Drop policies and disable RLS on user
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "user";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "user";`);
    await queryRunner.query(`ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;`);
  }
}
