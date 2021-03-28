import { Field, InputType, ObjectType } from "@nestjs/graphql"


@ObjectType() // graphQL 타입 -> CreateAccountOutput과 함께 작성해주어야함
export class MutationOutput {
    @Field(type => String, {nullable: true})  
    error?:string

    @Field(type => Boolean) 
    ok: boolean
}