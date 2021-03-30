import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class LoginInput extends PickType(User,["email", "password"]) {} // User entity에서 email과 password만 요청 <input>

@ObjectType()
export class LoginOutput extends CoreOutput{ // <output>
    @Field(type => String, {nullable:true}) // login이 token을 return
    token?: string; // token 은 있을 수도 없을 수도 있다
} 