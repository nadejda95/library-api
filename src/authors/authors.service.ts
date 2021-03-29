import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './authors.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Book } from '../books/books.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async create(data: CreateAuthorDto): Promise<Author> {
    await data;

    const author: Author = new Author();
    author.firstName = data.firstName;
    author.lastName = data.lastName;
    author.birthdate = new Date(data.birthdate);
    author.createdAt = author.updatedAt = new Date();

    return this.authorsRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return this.authorsRepository.find();
  }

  async findOne(id: string): Promise<Author> {
    try {
      return await this.authorsRepository.findOneOrFail(id);
    } catch (e) {
      throw new NotFoundException(e.errorMessage);
    }
  }

  async update(id: string, body: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    if (body.firstName !== undefined) {
      author.firstName = body.firstName;
    }

    if (body.lastName !== undefined) {
      author.lastName = body.lastName;
    }

    if (body.birthdate !== undefined) {
      author.birthdate = new Date(body.birthdate);
    }

    author.updatedAt = new Date();

    const updatedAuthor: Author = await this.authorsRepository.save(author);

    return updatedAuthor;
  }

  async remove(id: string) {
    try {
      await this.authorsRepository.delete(id);
      return await this.booksRepository.delete({ authorId: id });
    } catch (e) {
      throw new NotFoundException(e.errorMessage);
    }
  }

  async getAllAuthorBooks(id: string) {
    try {
      const author: Author = await this.authorsRepository.findOneOrFail(id);
      return await this.booksRepository.find({
        authorId: author.id.toHexString(),
      });
    } catch (e) {
      throw new NotFoundException(e.errorMessage);
    }
  }
}
