import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "./output.dto";

@InputType()
export class PaginationInput {
    @Field(type => Int, {defaultValue:1})
    page:number
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
    @Field(type => Int, {nullable:true})
    totalPages?: number

    @Field(type => Int, {nullable:true})
    totalResults?: number
}



// pagination (api에 page 1,2...를 요청하면 해당 page를 결과로 받는 것)