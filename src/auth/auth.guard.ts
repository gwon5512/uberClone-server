import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate { // CanActivate 함수는 true return 하면 req 진행 .. false 시 req 를 멈추게 한다. 
    canActivate(context:ExecutionContext) {     // Can ~~ 는 ExecutionContext 이 것이 req 의 context에 접근 할 수 있게 해준다.
        const gqlContext = GqlExecutionContext.create(context).getContext();
        // context 가 http 로 되어 있기 때문에 이 것을 graphql context 로 바꾸어 준다. 그렇게 되면 user를 가져 올 수 있다.
        const user = gqlContext['user']
        if(!user) {
            return false
        }
        return true;
    }                                        
}


// guard는 req를 다음 단계로 진행할지 말지 결정한다.