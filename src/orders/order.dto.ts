import { IsString, IsNumber } from 'class-validator';

class CreateOrderDto {
  @IsString()
  public item: string;
  @IsNumber()
  public totalPrice: number;
  @IsString()
  public payment: string;
}

export default CreateOrderDto;
