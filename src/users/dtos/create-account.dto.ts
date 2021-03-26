import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";


@InputType() // 작성유의! (err메세지 : Cannot dermine a graphQL input type ~~~)
export class CreateAccountInput extends PickType(User, [ // PickType은 우리가 가지고 싶은 것을 고를 수 있다
    'email',
    'password',
    'role'
]) {}

@ObjectType() // graphQL 타입
export class CreateAccountOutput {
    @Field(type => String, {nullable: true})            //  =====>  12~18 부분을 commonModule에 넣어 줄 수도 있다!!?
    error?:string

    @Field(type => Boolean) 
    ok: boolean
}