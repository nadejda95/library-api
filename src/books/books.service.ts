import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './books.entity';
import { Author } from '../authors/authors.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  async create(data: CreateBookDto): Promise<Book> {
    await data;

    try {
      const author: Author = await this.authorsRepository.findOneOrFail(
        data.authorId,
      );

      const book: Book = new Book();
      book.title = data.title;
      book.authorId = author.id.toHexString();
      book.iban = data.iban;
      book.publishedAt = new Date(data.publishedAt);
      book.createdAt = book.updatedAt = new Date();

      await this.booksRepository.insert(book);

      return book;
    } catch (e) {
      switch (e.name) {
        case 'MongoError':
          throw new BadRequestException(e.errorMessage);
        default:
          throw new NotFoundException(e.errorMessage);
      }
    }
  }

  async findOne(id: string): Promise<Book> {
    try {
      return await this.booksRepository.findOneOrFail(id);
    } catch (e) {
      throw new NotFoundException(e.errorMessage);
    }
  }

  async update(id: string, body: UpdateBookDto): Promise<Book> {
    const book: Book = await this.findOne(id);

    if (body.title !== undefined) {
      book.title = body.title;
    }

    if (body.authorId !== undefined) {
      book.authorId = body.authorId;
    }

    if (body.iban !== undefined) {
      book.iban = body.iban;
    }

    if (body.publishedAt !== undefined) {
      book.publishedAt = new Date(body.publishedAt);
    }

    book.updatedAt = new Date();

    await this.booksRepository.update(id, book);

    return book;
  }

  async remove(id: string) {
    try {
      return await this.booksRepository.delete(id);
    } catch (e) {
      throw new NotFoundException(e.errorMessage);
    }
  }
}
