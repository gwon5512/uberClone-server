import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";

import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";



@Resolver(of => User) // of 부분은 비어 있을 수도 있다! function이기만 하면 됨

export class UsersResolver {
    constructor(
    private readonly usersService : UsersService
    ) {}

    @Query(returns=> Boolean) // query root type 은 필수적으로 입력해야 한다!
    hi() {
        return true;
    }

    @Mutation(returns => CreateAccountOutput) // createaccount
    async createAccount(@Args("input") createAccountInput:CreateAccountInput) // createAccount 는 error 에 대해 물어보는 function 
    : Promise<CreateAccountOutput> { // Promise 잊지 말 것!
                                            // 이름 설정     // 타입 설정
           try {
            const {ok,error} = await this.usersService.createAccount(createAccountInput) // createAccount 는 string or undefined return
            if(error) {
                return { // error 핸들링 -> error가 있다면?
                    ok, // true/false 모두 가능      ==> array를 return 한다는 전제 하에 가능하다
                    error // 비어 있을 수도 있고 string이 될 수도 있다   ==> array를 return 한다는 전제 하에 가능하다
                }
            } // 만약 여기에 error가 없다면
            return {
                ok: true
            }
            } catch(error) { // 예상하지 못한 error 가 생긴다면
                return {
                    error,
                    ok:false
                }
        }

    }
                             
} // 이 파일은 오직 input을 가지고 output을 보내는 역할을 한다