import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Restaurant } from "../entites/restaurant.entity";


@InputType()
export class SearchRestaurantInput extends PaginationInput {
    @Field(type => String) // 검색 할 수 있는 term,query,keyword
    query:string
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

// 검색 시 여러개의 restaurant이 나올 수 있기에 제한