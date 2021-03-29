import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { AuthGuard } from "src/auth/auth.guard";
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

    @Query(returns => User) // 지금 로그인 되어있는 User 가 누구인지
    @UseGuards(AuthGuard)   // guard 사용(req를 멈추게 하는 역할)하여 어떤 엔드 포인트든지 보호할 수 있다.
    me() {}
}
// authentication 은 누가 자원을 요청하는지 확인하는 과정 token으로 identity를 확인
// authorization 은 user가 어떤 일을 하기전에 permission을 가지고 있는지 확인하는 과정



// token 을 보내고 그 token 은 req 로 보내진다. 그 req는 app.module의 implements consumer 부분에 잠시 멈추게 되고 먼저 jwtmiddleware 가 받은 후 
// token 을 찾고 그 것을 req user에 넣어준다. req 안에 새로운 것을 만든 것이다. 다음으로 req가 GraphQLModule 로 와서 context 안으로 들어오게 된다. 
// context를 함수로 호출하면 HTTP req 프로퍼티가 주어진다. 그러면 resolver가 context에 접근할 수 있다.
    


// token의 정보를 어떻게 받아오지? -> http headers 활용 
// middleware 구현 nextjs 의 middleware === express.js 의 middleware -> 요청을 받고 요청 처리 후 next() 함수 호출
// middleware 에서 token 을 가져 간 다음 그 token 가진 사용자 찾기
// client 가 요청을 보내면 middleware 가 처리하고 이 요청을 다음 handler 로 넘긴다.



// apollo server, graphql context 를 가지고 있다. context에 어떤 것들을 지정하더라도 resolver 에서 확인가능하다.
// graphql module 이 apollo server 에서 모든 것을 가져와 사용 할 수 있다.
// request context 는 각 request 에서 사용이 가능하다.
// context 가 함수로 정의되면 매 request 마다 호출된다.
// 이 것은 req 프로퍼티를 포함한 object 를 express 로 부터 받는다.
// context 에 프로퍼티를 넣으면 resolver 안에서 사용가능하다.