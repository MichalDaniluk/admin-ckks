import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { QueryBlogPostsDto } from './dto/query-blog-posts.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Blog Posts')
@ApiBearerAuth()
@Controller('blog-posts')
@UseInterceptors(ClassSerializerInterceptor)
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Post()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Blog post with this slug already exists' })
  async create(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.blogPostsService.create(createBlogPostDto);
  }

  @Get()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get all blog posts with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Blog posts retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryBlogPostsDto) {
    return this.blogPostsService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(id);
  }

  @Get('slug/:slug')
  @Roles('TENANT_ADMIN', 'TENANT_USER')
  @ApiOperation({ summary: 'Get a blog post by slug (public endpoint)' })
  @ApiParam({ name: 'slug', description: 'Blog post slug' })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogPostsService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  @ApiResponse({ status: 409, description: 'Blog post with this slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogPostsService.update(id, updateBlogPostDto);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a blog post (soft delete)' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 204, description: 'Blog post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.blogPostsService.remove(id);
  }

  @Post(':id/publish')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Publish a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post published successfully',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async publish(@Param('id') id: string) {
    return this.blogPostsService.publish(id);
  }

  @Post(':id/archive')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Archive a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async archive(@Param('id') id: string) {
    return this.blogPostsService.archive(id);
  }
}
