import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { IsDate, IsDefined, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Author {
  @ObjectIdColumn()
  @IsMongoId()
  id: ObjectID;

  @Column('text')
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  firstName: string;

  @Column('text')
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  lastName: string;

  @Column()
  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  @IsDefined()
  birthdate: Date;

  @Column()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Column()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
