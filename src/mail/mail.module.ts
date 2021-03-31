import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';


// 수동 모듈 말고도 nestJS의 mailer를 사용하는 다른 방법도 있음
@Module({})
export class MailModule {

    static forRoot(options:MailModuleOptions):DynamicModule { // module은 또 다른 module을 반환한다. forRoot 함수는 dynamic module을 반환
        return { // 반환할 module(dynamic 부분)
            module:MailModule,
            providers:[{ // 필요한 것을 전부 적어주고 jwtservice 파일에서 요청(inject)
                provide: CONFIG_OPTIONS, 
                useValue:options,
            },
            
        ],
            exports:[],
        }
    }
}
