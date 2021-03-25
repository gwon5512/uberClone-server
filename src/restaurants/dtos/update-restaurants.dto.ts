import { Args, ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { createRestaurantDto } from "./create-restaurants.dto";


@InputType()
class UpdateRestaurantInputType extends PartialType(createRestaurantDto) {}// createRestaurantDto 를 PartialType로 하는 이유는 UpdateRestaurantDto 에 id가 꼭 필요

@InputType()
@ArgsType()
export class UpdateRestaurantDto {
    @Field(type => Number)
    id:number;

    @Field(type => UpdateRestaurantInputType)
    data:UpdateRestaurantInputType
}

// PartialType은 type의 모든 프로퍼티를 말하지만 옵션사항이며 선택적인 프로퍼티를 의미한다.