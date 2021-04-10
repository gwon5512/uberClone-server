import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Category } from "../entites/cetegory.entity";

@ObjectType() // output의 타입은 ObjectType
// input 필요하지 않음 모든 category의 restaurant를 가져오기에
export class AllCategoriesOutput extends CoreOutput {

    @Field(type => [Category], {nullable: true}) // graphql ... return type 일치시키기
    categories?: Category[] // 항상 있는 것이 아니고 에러가 날 수 있기에 "?(있을 수도 없을 수도)" 사용 // typescript

}