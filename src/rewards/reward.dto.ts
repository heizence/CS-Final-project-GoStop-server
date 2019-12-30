import { IsString, IsNumber } from 'class-validator';

class CreateRewardDto {
  @IsString()
  public title: string;
  @IsString()
  public description: string;
}

export default CreateRewardDto;
