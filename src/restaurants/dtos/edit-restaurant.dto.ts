import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CreateRestaurantInput } from "./create-restaurants.dto";

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {

    @Field(type => Number)
    restaurantId: number;

}
// partialtype을 사용해 프로퍼티들을 optional로 해준다



// partialtype은 class의 모든 프로퍼티를 가져옴
// picktype은 원하는 class의 프로퍼티를 가져옴

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}

// dto -> resolver -> service