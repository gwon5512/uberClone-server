import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";

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
            return this.usersService.createAccount(createAccountInput) // createAccount 는 string or undefined return
            } catch(error) { // 예상하지 못한 error 가 생긴다면
                return {
                    error,
                    ok:false
                } 
        }

    }

    @Mutation(returns=> LoginOutput)
    async login(@Args('input') loginInput: LoginInput) : Promise<LoginOutput> { // 무엇을 넣을지 login.dto에서 작성 -> return 해주어야함
        try {
            return this.usersService.login(loginInput)
           
        } catch (error) {
            return{
                ok:false,
                error
                }
        }
                             
    } // 이 파일은 오직 input을 가지고 output을 보내는 역할을 한다

}
