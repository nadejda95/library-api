import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import { IsDateString, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  authorId?: string;

  @Column({ unique: true })
  @ApiPropertyOptional()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  iban?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsDefined()
  @IsNotEmpty()
  publishedAt?: Date;
}
