import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";


export const AuthUser = createParamDecorator( // AuthUser가 decorator 이름
    (data:unknown, context:ExecutionContext) => { // auth.guard 와 비슷한 로직
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const user = gqlContext['user'];
        return user; // 어떤 것을 리턴 하던지 간에 authUser(이름변경가능)에 받아진다.
    }
)