import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "src/jwt/jwt.service";
import { User } from "src/users/entities/user.entity";
import { UserService } from "src/users/users.service";
import { AllowedRoles} from "./role.decorator"

@Injectable()
export class AuthGuard implements CanActivate { // CanActivate 함수는 true return 하면 req 진행 .. false 시 req 를 멈추게 한다. 
    constructor(
        private readonly reflector : Reflector,
        private readonly jwtService : JwtService,
        private readonly userService : UserService
        ) {} // role을 get
    async canActivate(context:ExecutionContext) {     // Can ~~ 는 ExecutionContext 이 것이 req 의 context에 접근 할 수 있게 해준다.
        const roles = this.reflector.get<AllowedRoles>('roles',context.getHandler())
         // reflector는 metadata를 get... role.decorator 파일 SetMetadata의 key('roles')와 같아야함
        if(!roles) { // resolver에 metadata가 없으면 true(resolver가 public) -> connection 또는 req 가 계속 될 수 있도록 허용
            return true // roles 없다면 그냥 지나감(보호가 필요하지 않기 때문)... 누구나 쓸 수 있는 resolver
        }

        // role이 있다면?
        const gqlContext = GqlExecutionContext.create(context).getContext(); // resolver에 metadata가 있으면 GqlExecutionContext에서 user확인 
        
        const token = gqlContext.token // context에 token 존재
        // token이 존재하면 토큰이 있는지 확인... token decode
        if(token) {
            const decoded = this.jwtService.verify((token + "")); // token 암호해독 -> toString()?? (token + "") toString() .. 

        // context 가 http 로 되어 있기 때문에 이 것을 graphql context 로 바꾸어 준다. 그렇게 되면 user를 가져 올 수 있다.
        if(typeof decoded === 'object' && decoded.hasOwnProperty('id')) { // decoded의 프로퍼티 중에 id가 있으면 
            // user 찾기    
            const {user} = await this.userService.findById(decoded['id'])
            if(!user) { // resolver에 metadata가 있는데 user가 없다는 것(token을 보내주지 않았거나 잘못된경우)
                return false
            }
            // guard가 decorator보다 먼저 호출되기에
            // guard가 user를 graphql context에 추가하고
            // decorator가 호출되면 decorator가 graphql context 내부에서 user를 찾음
            gqlContext['user'] = user;
            if(roles.includes('Any')) { // 어떤 user든 진행가능
                return true
            }
            return roles.includes(user.role) // roles가 delivery user.role이 owner면 false
            // metadata roles가 다른 metadata인 user.role을 포함하는가를 리턴
          } else { // token에 문제가 있다면?
              return false
          }
        } else {
            return false
        }
    }                                        
}

// metadata 가져오기

// guard는 req를 다음 단계로 진행할지 말지 결정한다.
