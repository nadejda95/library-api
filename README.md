# Installation

```bash
$ npm install
```

# Database connection configuration

Connection to database is stored in `.env` file

```bash
cp .env.dist .env
```

Fill all necessary data for default database and testing database.

# Running the app

Before start don\`t forget to fill `.env` file with database configuration.

Prerequisites: installed locally or remote mongodb.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Test

Before start don\`t forget to fill `.env` file with database configuration.

Prerequisites: installed locally or remote mongodb.

```bash
# e2e tests
$ npm run test:e2e
```
