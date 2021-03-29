import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  authorId: string;

  @Column({ unique: true })
  @ApiProperty()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  iban: string;

  @ApiProperty()
  @IsDateString()
  @IsDefined()
  @IsNotEmpty()
  publishedAt: Date;
}
