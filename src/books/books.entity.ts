import { Entity, Column, ObjectIdColumn, ObjectID, Index } from 'typeorm';
import {
  IsDate,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Book {
  @ObjectIdColumn()
  @IsMongoId()
  id: ObjectID;

  @Column()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  title: string;

  @Column()
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  @Index()
  authorId: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  iban: string;

  @Column()
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  publishedAt: Date;

  @Column()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Column()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
