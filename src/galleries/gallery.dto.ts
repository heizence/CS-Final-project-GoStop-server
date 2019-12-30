import { IsString, ArrayContains } from 'class-validator';

class CreateGalleryDto {
  @IsString()
  public todos: string;
  // @ArrayContains(File: any[])
  // public files: Express.Multer.File[];
}

export default CreateGalleryDto;
