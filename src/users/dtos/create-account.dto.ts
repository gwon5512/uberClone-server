import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";


@InputType() // 작성유의! (err메세지 : Cannot dermine a graphQL input type ~~~)
export class CreateAccountInput extends PickType(User, [ // PickType은 우리가 가지고 싶은 것을 고를 수 있다
    'email',
    'password',
    'role'
]) {}

@ObjectType() // graphQL 타입 common module의 MutationOutput과 함께 작성해주어야함
export class CreateAccountOutput extends MutationOutput{}