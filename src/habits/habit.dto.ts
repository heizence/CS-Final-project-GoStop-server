import { IsString, IsNumber, IsBoolean } from 'class-validator';

class CreateHabitDto {
  @IsString()
  public title: string;
  @IsString()
  public description: string;
}

export default CreateHabitDto;
