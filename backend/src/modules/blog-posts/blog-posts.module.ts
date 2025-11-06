import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPost } from './entities/blog-post.entity';
import { TenantModule } from '@/common/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost]),
    TenantModule,
  ],
  controllers: [BlogPostsController],
  providers: [BlogPostsService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}
