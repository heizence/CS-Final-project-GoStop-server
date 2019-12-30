import { IsString, IsNumber, IsObject } from 'class-validator';

class CreateItemDto {
  @IsString()
  public name: string;
  @IsString()
  public category: string;
  @IsNumber()
  public price: number;
}

export default CreateItemDto;
