import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { UserService } from "src/users/users.service";
import { JwtService } from "./jwt.service";

@Injectable() // 해야만 inject 가능
export class JwtMiddleware implements NestMiddleware { // NestMiddleware를 상속(implements) 받아야한다. implements !== extends
    constructor(private readonly jwtService : JwtService,
                private readonly userService : UserService) {} // users.service가 필요 -> user.module 에서 export 해주어야함
    async use(req:Request, res: Response, next: NextFunction) { // implements는 해당 class가 nest-middleware.interface.d.ts 의 inferface 처럼 행동해야 한다.
                                         // ↑ express 서버에서 하는 구현과 차이 X
        if("x-jwt" in req.headers) {
            const token = req.headers['x-jwt']; // token 저장
            try {   
            const decoded = this.jwtService.verify((token + "")); // token 암호해독 -> toString()?? (token + "") toString()
            
            if(typeof decoded === 'object' && decoded.hasOwnProperty('id')) { // decoded의 프로퍼티 중에 id가 있으면 
                
                    const user = await this.userService.findById(decoded['id'])
                    
                    // ↓ user는 req 프로퍼티에 있다. 고로 resolver에서 공유 가능
                    req['user'] = user  // user를 찾아 user 를 request로 보내기 -> graphql 로 해당 req를 공유(graphql resolver에 전달)
                } 
            } catch (e) {

            }
        
        }
        next(); // express 처럼 next!! 잊지 말 것 ! ===> req['user'] = user
    }
}
// headers에서 user를 request 보내는 middleware 구현

// export function jwtMiddleware(req:Request, res: Response, next: NextFunction) {
//     console.log(req.headers);
//     next();
// }