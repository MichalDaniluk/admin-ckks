import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBlogPostTable1762357000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for blog post status
    await queryRunner.query(`
      CREATE TYPE blog_post_status_enum AS ENUM ('draft', 'published', 'archived');
    `);

    // Create blog_post table
    await queryRunner.createTable(
      new Table({
        name: 'blog_post',
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
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'excerpt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'featured_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'author',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'blog_post_status_enum',
            default: "'draft'",
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'meta_description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'view_count',
            type: 'int',
            default: 0,
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

    // Create indexes
    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_BLOG_POST_TENANT',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_BLOG_POST_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_BLOG_POST_SLUG',
        columnNames: ['slug'],
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_BLOG_POST_PUBLISHED_AT',
        columnNames: ['published_at'],
      }),
    );

    await queryRunner.createIndex(
      'blog_post',
      new TableIndex({
        name: 'IDX_BLOG_POST_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'blog_post',
      new TableForeignKey({
        name: 'FK_BLOG_POST_TENANT',
        columnNames: ['tenant_id'],
        referencedTableName: 'tenant',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Enable RLS on blog_post table
    await queryRunner.query(`
      ALTER TABLE "blog_post" ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policy for tenant isolation
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON "blog_post"
      USING (tenant_id::text = current_setting('app.current_tenant', true))
      WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    // Create policy for super admin
    await queryRunner.query(`
      CREATE POLICY super_admin_policy ON "blog_post"
      USING (current_setting('app.bypass_rls', true) = 'true');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS super_admin_policy ON "blog_post";`);
    await queryRunner.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "blog_post";`);
    await queryRunner.query(`ALTER TABLE "blog_post" DISABLE ROW LEVEL SECURITY;`);

    // Drop foreign key
    await queryRunner.dropForeignKey('blog_post', 'FK_BLOG_POST_TENANT');

    // Drop table
    await queryRunner.dropTable('blog_post');

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS blog_post_status_enum;`);
  }
}
