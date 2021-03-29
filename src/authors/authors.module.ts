import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { Author } from './authors.entity';
import { Book } from '../books/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book])],
  providers: [AuthorsService],
  controllers: [AuthorsController],
})
export class AuthorsModule {}
