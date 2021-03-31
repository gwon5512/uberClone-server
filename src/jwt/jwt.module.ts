import { DynamicModule, Module, Global } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()

export class JwtModule {
    static forRoot(options:JwtModuleOptions):DynamicModule { // module은 또 다른 module을 반환한다. forRoot 함수는 dynamic module을 반환
        return { // 반환할 module(dynamic 부분)
            module:JwtModule,
            providers:[{ // 필요한 것을 전부 적어주고 jwtservice 파일에서 요청(inject)
                provide: CONFIG_OPTIONS, 
                useValue:options,
            },
            JwtService // === {provide:JwtService, useClass:JwtService}
        ],
            exports:[JwtService],
        }
    }

}


// module의 종류
// 1. static module -> 어떠한 설정도 되어 있지 않은 module ex)UsersModule
// 2. dynamic module -> 설정이 되어 있는 module ex)forRoot
// dynamic module은 결과적으로 static module이 된다.
// dynamic module은 중간과정이다. 설정을 조작해주어야 하기에

// dynamic module을 만들어보고 여러 옵션을 적용한 후 리턴 값으로 우리가 설정한 옵션들이 존재하는 상태의 static module을 내보내는 것!