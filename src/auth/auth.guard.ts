import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { AllowedRoles} from "./role.decorator"

@Injectable()
export class AuthGuard implements CanActivate { // CanActivate 함수는 true return 하면 req 진행 .. false 시 req 를 멈추게 한다. 
    constructor(private readonly reflector : Reflector) {} // role을 get
    canActivate(context:ExecutionContext) {     // Can ~~ 는 ExecutionContext 이 것이 req 의 context에 접근 할 수 있게 해준다.
        const roles = this.reflector.get<AllowedRoles>('roles',context.getHandler())
         // reflector는 metadata를 get... role.decorator 파일 SetMetadata의 key('roles')와 같아야함
        if(!roles) { // resolver에 metadata가 없으면 true(resolver가 public) -> connection 또는 req 가 계속 될 수 있도록 허용
            return true
        }
        const gqlContext = GqlExecutionContext.create(context).getContext(); // resolver에 metadata가 있으면 GqlExecutionContext에서 user확인 
        // context 가 http 로 되어 있기 때문에 이 것을 graphql context 로 바꾸어 준다. 그렇게 되면 user를 가져 올 수 있다.
        const user:User = gqlContext['user']
        if(!user) { // resolver에 metadata가 있는데 user가 없다는 것(token을 보내주지 않았거나 잘못된경우)
            return false
        }
        if(roles.includes('Any')) { // 어떤 user든 진행가능
            return true
        }
        return roles.includes(user.role) // roles가 delivery user.role이 owner면 false
        // metadata roles가 다른 metadata인 user.role을 포함하는가를 리턴
    }                                        
}

// metadata 가져오기

// guard는 req를 다음 단계로 진행할지 말지 결정한다.
