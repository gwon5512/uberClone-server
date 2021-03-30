import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";
import { CoreOutput } from "src/common/dtos/output.dto"

@ObjectType()
export class EditProfileOutput extends CoreOutput {

}

@InputType()
export class EditProfileInput extends PartialType( // optional
    PickType(User,['email','password']) // user에서 email/password를 가지고 class 생성 
) {}
