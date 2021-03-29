import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({
    description: 'Create new book',
  })
  @ApiResponse({
    status: 201,
    description: 'Book was successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Book found',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    description: 'Update existing book',
  })
  @ApiResponse({
    status: 200,
    description: 'Book was successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({
    description: 'Delete existing book',
  })
  @ApiResponse({
    status: 200,
    description: 'Book was successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
