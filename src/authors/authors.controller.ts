import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({
    description: 'Create new author',
  })
  @ApiResponse({
    status: 201,
    description: 'Author was successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async create(@Body() body: CreateAuthorDto) {
    return this.authorsService.create(body);
  }

  @Get()
  @ApiOperation({
    description: 'Get all authors',
  })
  @ApiResponse({
    status: 200,
    description: 'Authors returned',
  })
  async findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    description: 'Find Author by his id',
  })
  @ApiResponse({
    status: 200,
    description: 'Author was successfully found',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  async findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    description: 'Update existing author',
  })
  @ApiResponse({
    status: 200,
    description: 'Author was successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  async update(@Param('id') id: string, @Body() body: UpdateAuthorDto) {
    return this.authorsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'Delete existing author',
  })
  @ApiResponse({
    status: 200,
    description: 'Author was successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  async remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }

  @Get(':id/books')
  @ApiOperation({
    description: 'Get all author books',
  })
  @ApiResponse({
    status: 200,
    description: 'Books returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  findAllAuthorBooks(@Param('id') id: string) {
    return this.authorsService.getAllAuthorBooks(id);
  }
}
