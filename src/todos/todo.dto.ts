import { IsString } from 'class-validator';

class CreateTodoDto {
  @IsString()
  public title: string;
  @IsString()
  public description: string;
}

export default CreateTodoDto;
