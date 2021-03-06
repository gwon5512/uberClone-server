import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Category } from "../entites/cetegory.entity";

@InputType()
export class CategoryInput extends PaginationInput {
    @Field(type => String)
    slug: string
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
    @Field(type => Category,{nullable:true}) // 에러가 생겨서 category가 없을 수도 있기에 
    category?: Category
}