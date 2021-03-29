import { Injectable,Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService { // $ nest g s jwt (jwt.service 생성)
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options : JwtModuleOptions,
        // private readonly configService : ConfigService 도 가능 ConfigService 는 global
    ) {
        // console.log(options)
    }
    sign(userId:number) : string { // module을 해당 프로젝트만 사용할 것인지 다른 프로젝트에서도 사용가능하게 만들 것인지 정해 줄 수 있다. 여기서만 사용할 것이기에 userId만 암호화
        return jwt.sign({id:userId}, this.options.privateKey) // 모두 사용하게 하려면 payload 사용
    }
    verify(token:string) {
        return jwt.verify(token, this.options.privateKey)
    }
} 
