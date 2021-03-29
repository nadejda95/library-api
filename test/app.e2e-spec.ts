import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../src/authors/authors.entity';
import { Book } from '../src/books/books.entity';
import { AuthorsModule } from '../src/authors/authors.module';
import { BooksModule } from '../src/books/books.module';
import { AppModule } from '../src/app.module';
import { MongoRepository } from 'typeorm';
import { plainToClass } from 'class-transformer';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let authorsRepository: MongoRepository<Author>;
  let booksRepository: MongoRepository<Book>;

  const authorFixture: {
    firstName: string;
    lastName: string;
    birthdate: string;
  } = {
    firstName: 'JK',
    lastName: 'Rowling',
    birthdate: '1965-07-31',
  };
  const bookFixture: {
    title: string,
    iban: string,
    publishedAt: string,
    authorId: string,
  } = {
    title: 'Harry Potter and the Deathly Hallows',
    iban: 'hp713',
    publishedAt: '2007-07-21',
    authorId: '',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        AuthorsModule,
        BooksModule,
        TypeOrmModule.forRoot({
          type: 'mongodb',
          host: process.env.TEST_DB_HOST,
          port: parseInt(process.env.TEST_DB_PORT),
          username: process.env.TEST_DB_USER,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          entities: [Author, Book],
          synchronize: true,
          keepConnectionAlive: true,
          useUnifiedTopology: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    authorsRepository = app.get('AuthorRepository');
    booksRepository = app.get('BookRepository');

    await app.init();
  });

  afterEach(async (done) => {
    await authorsRepository.queryRunner.clearDatabase();
    await authorsRepository.queryRunner.connection.close();
    return done();
  });

  afterAll(async () => {
    await authorsRepository.queryRunner.clearDatabase();
    await authorsRepository.queryRunner.connection.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /authors', async (done) => {
    const author: Author = plainToClass(Author, authorFixture);

    await authorsRepository.save(author);

    return request(app.getHttpServer())
      .get('/authors')
      .expect(200)
      .expect((response) => {
        const data = response.body[0];
        if (data.firstName !== author.firstName) {
          throw new Error(
            `Wrong first name: expected - ${author.firstName}, received - ${data.firstName}`,
          );
        }

        if (data.lastName !== author.lastName) {
          throw new Error(
            `Wrong last name: expected - ${author.lastName}, received - ${data.lastName}`,
          );
        }

        if (data.birthdate !== author.birthdate) {
          throw new Error(
            `Wrong birthdate: expected - ${author.birthdate}, but data ${data.birthdate}`,
          );
        }

        return done();
      });
  });

  describe('POST /authors', () => {
    it('should save new author', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send(authorFixture)
        .set('Accept', 'application/json')
        .expect(201)
        .expect((response) => {
          const body = response.body;

          if (body.firstName !== authorFixture.firstName) {
            throw new Error(
              `Wrong first name: expected - ${authorFixture.firstName}, received - ${body.firstName}`,
            );
          }

          if (body.lastName !== authorFixture.lastName) {
            throw new Error(
              `Wrong last name: expected - ${authorFixture.lastName}, received - ${body.lastName}`,
            );
          }

          return done();
        });
    });
    it('should return 400 if first name is missing', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          lastName: 'Rowling',
          birthdate: '1965-07-31',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages: Array<string> = [
            'firstName should not be null or undefined',
            'firstName should not be empty',
            'firstName must be a string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
    it('should return 400 if last name is missing', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'JK',
          birthdate: '1965-07-31',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages: Array<string> = [
            'lastName should not be null or undefined',
            'lastName should not be empty',
            'lastName must be a string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
    it('should return 400 if birthdate is missing or has bad format', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'JK',
          lastName: 'Rowling',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages: Array<string> = [
            'birthdate should not be null or undefined',
            'birthdate must be a valid ISO 8601 date string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
  });

  describe('PUT /authors/:id', () => {
    it('should update info about existing author with all parameters', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .put(`/authors/${author.id}`)
        .send({
          firstName: 'Lord',
          lastName: 'Voldemort',
          birthdate: '1926-12-31',
        })
        .set('Accept', 'application/json')
        .expect(200)
        .expect((response) => {
          const body = response.body;

          if (body.firstName !== 'Lord') {
            throw new Error(
              `Wrong first name: expected - Lord, received - ${body.firstName}`,
            );
          }

          if (body.lastName !== 'Voldemort') {
            throw new Error(
              `Wrong last name: expected - Voldemort, received - ${body.lastName}`,
            );
          }

          const birthdate: Date = new Date('1926-12-31');
          const birthdateStr: string = birthdate.toISOString();
          if (body.birthdate !== birthdateStr) {
            throw new Error(
              `Wrong birthdate: expected - ${birthdateStr}, received - ${body.birthdate}`,
            );
          }

          return done();
        });
    });
    it('should update one field of existing author', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .put(`/authors/${author.id}`)
        .send({
          firstName: 'Lord',
        })
        .set('Accept', 'application/json')
        .expect(200)
        .expect((response) => {
          const body = response.body;

          if (body.firstName !== 'Lord') {
            throw new Error(
              `Wrong first name: expected - Lord, received - ${body.firstName}`,
            );
          }

          if (body.lastName !== authorFixture.lastName) {
            throw new Error(
              `Wrong last name: expected - ${authorFixture.lastName}, received - ${body.lastName}`,
            );
          }

          return done();
        });
    });
    it('should return 400 if date format is wrong', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .put(`/authors/${author.id}`)
        .send({
          birthdate: 'birthdate',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (
            body.message[0] !== 'birthdate must be a valid ISO 8601 date string'
          ) {
            throw new Error(
              `Wrong error message: received - ${body.message[0]}`,
            );
          }

          return done();
        });
    });
    it('should return 404 on nonexistent author', async (done) => {
      return request(app.getHttpServer())
        .put('/authors/713')
        .send(authorFixture)
        .set('Accept', 'application/json')
        .expect(404)
        .expect((response) => {
          const body = response.body;

          if (body.message !== 'Not Found') {
            throw new Error(`Wrong error message: received - ${body.message}`);
          }

          return done();
        });
    });
  });
  describe('GET /authors/:id', () => {
    it('should return existing author', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .get(`/authors/${author.id}`)
        .expect(200)
        .expect((response) => {
          const body = response.body;

          if (body.firstName !== authorFixture.firstName) {
            throw new Error(
              `Wrong first name: expected - ${authorFixture.firstName}, received - ${body.firstName}`,
            );
          }

          if (body.lastName !== authorFixture.lastName) {
            throw new Error(
              `Wrong last name: expected - ${authorFixture.lastName}, received - ${body.lastName}`,
            );
          }

          return done();
        });
    });
    it('should return 404 on nonexistent author', async (done) => {
      return request(app.getHttpServer())
        .get(`/authors/713`)
        .expect(404)
        .expect((response) => {
          const body = response.body;

          if (body.message !== 'Not Found') {
            throw new Error(`Wrong error message: received - ${body.message}`);
          }

          return done();
        });
    });
  });
  describe('DELETE /authors/:id', () => {
    it('should delete existing author', async () => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .delete(`/authors/${author.id}`)
        .expect(200);
    });
    it('should return 404 on nonexistent author', async (done) => {
      return request(app.getHttpServer())
        .delete(`/authors/713`)
        .expect(404)
        .expect((response) => {
          const body = response.body;

          if (body.message !== 'Not Found') {
            throw new Error(`Wrong error message: received - ${body.message}`);
          }

          return done();
        });
    });
  });
  describe('GET /authors/:id/books', () => {
    it('should return author`s books', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .get(`/authors/${author.id}/books`)
        .expect(200)
        .expect((response) => {
          const body = response.body[0];

          if (body.title !== bookFixture.title) {
            throw new Error(
              `Wrong title: expected - ${bookFixture.title}, received - ${body.title}`,
            );
          }

          if (body.iban !== bookFixture.iban) {
            throw new Error(
              `Wrong iban: expected - ${bookFixture.iban}, received - ${body.iban}`,
            );
          }

          return done();
        });
    });
    it('should return 404 on nonexistent author', () => {
      return request(app.getHttpServer()).get(`/authors/713/books`).expect(404);
    });
  });
  describe('POST /books', () => {
    it('should create new book', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book = bookFixture;
      book.authorId = author.id.toHexString();

      return request(app.getHttpServer())
        .post(`/books`)
        .send(book)
        .set('Accept', 'application/json')
        .expect(201)
        .expect((response) => {
          const body = response.body;

          if (body.title !== book.title) {
            throw new Error(
              `Wrong title: expected - ${book.title}, received - ${body.title}`,
            );
          }

          if (body.iban !== book.iban) {
            throw new Error(
              `Wrong IBAN: expected - ${book.iban}, received - ${body.iban}`,
            );
          }

          return done();
        });
    });
    it('should return 400 on bad date format', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      bookFixture.authorId = author.id.toHexString();
      bookFixture.publishedAt = 'date';

      return request(app.getHttpServer())
        .post(`/books`)
        .send(bookFixture)
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (
            body.message[0] !==
            'publishedAt must be a valid ISO 8601 date string'
          ) {
            throw new Error(
              `Wrong error message: received - ${body.message[0]}`,
            );
          }

          return done();
        });
    });
    it('should return 400 on missing title', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .post(`/books`)
        .send({
          authorId: author.id.toHexString(),
          iban: 'hp713',
          publishedAt: '2007-07-21',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages = [
            'title should not be null or undefined',
            'title should not be empty',
            'title must be a string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
    it('should return 400 on missing iban', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .post(`/books`)
        .send({
          authorId: author.id.toHexString(),
          title: 'Harry Potter and the Deathly Hallows',
          publishedAt: '2007-07-21',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages: Array<string> = [
            'iban should not be null or undefined',
            'iban should not be empty',
            'iban must be a string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
    it('should return 400 on missing publication date', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      return request(app.getHttpServer())
        .post(`/books`)
        .send({
          authorId: author.id.toHexString(),
          title: 'Harry Potter and the Deathly Hallows',
          iban: 'hp713',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (body.error !== 'Bad Request') {
            throw new Error(
              `Wrong error: expected - 'Bad request', received - ${body.message}`,
            );
          }

          const messages: Array<string> = [
            'publishedAt should not be null or undefined',
            'publishedAt should not be empty',
            'publishedAt must be a valid ISO 8601 date string',
          ];
          messages.forEach((msg) => {
            if (body.message.indexOf(msg) === -1) {
              throw new Error(`Missing necessary error message - "${msg}"`);
            }
          });

          return done();
        });
    });
    it('should return 400 on duplicate iban', async () => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .post(`/books`)
        .send({
          authorId: author.id.toHexString(),
          title: 'Harry Potter and the Deathly Hallows',
          iban: bookFixture.iban,
          publishedAt: '2007-07-21',
        })
        .set('Accept', 'application/json')
        .expect(400);
    });
    it('should return 404 on nonexistent author', () => {
      return request(app.getHttpServer())
        .post(`/books`)
        .send({
          authorId: '60621eb7f1a2af85a9308a17',
          title: 'Harry Potter and the Deathly Hallows',
          iban: 'hp713',
          publishedAt: '2007-07-21',
        })
        .set('Accept', 'application/json')
        .expect(404);
    });
  });
  describe('PUT /books/:id', () => {
    it('should update existing book', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .put(`/books/${book.id}`)
        .send({
          title: 'Harry Potter and the Half-Blood Prince',
        })
        .set('Accept', 'application/json')
        .expect(200)
        .expect((response) => {
          const body = response.body;

          if (body.title !== 'Harry Potter and the Half-Blood Prince') {
            throw new Error(
              `Wrong title: expected - Harry Potter and the Half-Blood Prince, received - ${body.title}`,
            );
          }

          return done();
        });
    });
    it('should return 400 on bad date format', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .put(`/books/${book.id}`)
        .send({
          publishedAt: 'date',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((response) => {
          const body = response.body;

          if (
            body.message[0] !==
            'publishedAt must be a valid ISO 8601 date string'
          ) {
            throw new Error(
              `Wrong error message: expected - 'publishedAt must be a valid ISO 8601 date string', received - ${body.message[0]}`,
            );
          }

          return done();
        });
    });
    it('should return 404 on nonexistent book', () => {
      return request(app.getHttpServer())
        .put(`/books/713`)
        .send({
          publishedAt: '2007-07-21',
        })
        .set('Accept', 'application/json')
        .expect(404);
    });
  });
  describe('GET /books/:id', () => {
    it('should return book', async (done) => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200)
        .expect((response) => {
          const body = response.body;

          if (body.title !== book.title) {
            throw new Error(
              `Wrong title: expected - ${book.title}, received - ${body.title}`,
            );
          }

          if (body.iban !== book.iban) {
            throw new Error(
              `Wrong IBAN: expected - ${book.iban}, received - ${body.iban}`,
            );
          }

          return done();
        });
    });
    it('should return 404 on nonexistent book', () => {
      return request(app.getHttpServer()).get(`/books/713`).expect(404);
    });
  });
  describe('DELETE /books/:id', () => {
    it('should delete book', async () => {
      const author: Author = plainToClass(Author, authorFixture);

      await authorsRepository.save(author);

      const book: Book = plainToClass(Book, bookFixture);
      book.authorId = author.id.toHexString();

      await booksRepository.save(book);

      return request(app.getHttpServer())
        .delete(`/books/${book.id}`)
        .expect(200);
    });
    it('should return 404 on nonexistent book', () => {
      return request(app.getHttpServer()).delete(`/books/713`).expect(404);
    });
  });
});
