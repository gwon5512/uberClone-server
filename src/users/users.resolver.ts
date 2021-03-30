import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";



@Resolver(of => User) // of 부분은 비어 있을 수도 있다! function이기만 하면 됨

export class UsersResolver {
    constructor(
    private readonly usersService : UsersService
    ) {}

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
    me(@AuthUser()AuthUser : User) {
        return AuthUser; 
    } // user를 위한 decorator 만들기 (login 유무에 따라 req 진행 or X시키기위해)

    
    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput) // user의 profile을 볼 수 있는 query
    async userProfile(@Args()userProfileInput : UserProfileInput) : Promise <UserProfileOutput> {
        try {
        const user = await this.usersService.findById(userProfileInput.userId) // token function
        if(!user) {                         // findOne 은 entity나 undefined 일 수 있다.
            throw Error()
        }
        return {
            ok:true, // user를 찾으면 ok true... undefined 이면 false
            user,
            }
        } catch(e) {
            return {
                error:"User Not Found",
                ok:false
            }
        }

    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput) // dto
    async editProfile( // input
        @AuthUser() authUser:User, // 현재 login 한 사용자 정보
        @Args('input') editProfileInput : EditProfileInput
        ):Promise <EditProfileOutput>{
            try {
                await this.usersService.editProfile(authUser.id, editProfileInput)
                return {                            // userId     // password
                    ok:true
                }
            } catch(error) {
                return {
                    ok:false,
                    error
                }
            }
        }
    }
// authentication 은 누가 자원을 요청하는지 확인하는 과정 token으로 identity를 확인
// module(static/dynamic), providers, dependency injection, middlewares, guard, decorators, context
// header에 token을 보낸다 header는 http 기술이며 이를 사용하기 위해 middleware(header를 가져다가 jwtService.verify()사용)를 만듬
// id를 찾게 되면 userService를 사용해 해당 id를 가진 user를 찾는다. -findeBuId 이용
// 그 후 user를 req obj에 붙여서 보낸다. 이 middleware를 가장 먼저 만나기 때문에 원하는대로 req obj를 바꿀 수 있다. 그리고 모든 resolver에서 사용가능
// 만약 token이 없거나 에러가 있다면 아니면 user를 찾을 수 없다면 req에는 어떤 것도 붙이지 않는다.

// app.module의 context를 보면 apollo server의 context나 graphql의 context는 모든 resolver에 정보를 보낼 수 있는 프로퍼티이다.
// context get은 매 req 마다 호출됨... context에서 function을 만들면 이 function이 req object(user key를 가진 http)를 준다.
// JwtMiddleware를 거친 후 graphql context에 req user(context user)를 보낸다.

// guard는 function의 기능을 보충(canActivate).. true return 시 req 진행 false return 시 req 중지
// ExecutionContext를 GqlExecutionContext로 바꿔줘야 함... getContext는 app.module에 있는 context와 graphql context가 같다는 것을 말한다.

// resolver에서 decorator는 context를 가져다가 graphql context로 바꾼다. 그리고 user를 가져오면 user를 return
// decorator는 value return



// 요점 ==> header에 token을 보내고 token을 decrypt,verify 하는 middleware를 거쳐 req obj에 user를 추가한 후 req obj가 graphql context 안에 들어가고 
// guard가 graphql context를 찾아 user의 유무에 따라 t/f return...
// 마지막에 guard에 의해 req가 authorize가 되면 resolver에 decorator가 필요한데 decorator는 graphql context에서 찾은 user와 같은 user를 찾으려고 한다. 그리고return






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