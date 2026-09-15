import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Star rating from 1 to 5' })
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1 star.' })
  @Max(5, { message: 'Rating cannot exceed 5 stars.' })
  rating: number;

  @ApiProperty({ example: 'Stunning everyday shine!', description: 'Headline summary of the review' })
  @IsString()
  @IsNotEmpty({ message: 'Please provide a title for your review.' })
  title: string;

  @ApiProperty({
    example: 'The gold plating has exceptional warmth and causes zero allergic irritation.',
    description: 'Detailed review comment',
  })
  @IsString()
  @IsNotEmpty({ message: 'Please provide review comments.' })
  comment: string;
}
