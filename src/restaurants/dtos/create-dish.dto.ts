import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Dish } from "../entites/dish.entity";


@InputType()
export class CreateDishInput extends PickType(Dish, [
    'name',
    'price',
    'description',
    'options'
]) { // Dish의 원하는 프로퍼티 가져오기 
    // restaurant id 얻기(dish 추가 시 어떤 restaurant에 추가할지 파악)
    @Field(type => Int)
    restaurantId: number
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {
    
}