import { Field, InputType, Int, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Dish } from "../entites/dish.entity";

@InputType()
export class EditDishInput extends PickType(PartialType(Dish),[
    "name",
    "options",
    "price",
    "description"
]) {
    @Field(type => Int)
    dishId: number // dishId 없이는 dish 수정X

} // 모든 dish의 프로퍼티가 선택적(optional)이면서 여기서 특정 프로퍼티를 고른다는 의미


@ObjectType()
export class EditDishOutput extends CoreOutput {}