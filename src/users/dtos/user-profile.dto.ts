import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto"
import { User } from "../entities/user.entity";


@ArgsType()
export class UserProfileInput {
    @Field(type => Number)
    userId:number
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
    @Field(type => User,{nullable:true}) // 어떨 때는 user를 찾지만 어떨 때는 못찾을 수 있기에(nullable)
    user?:User 
}