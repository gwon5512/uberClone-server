import { Module } from '@nestjs/common';

@Module({})
export class JwtModule {}


// module의 종류
// 1. static module -> 어떠한 설정도 되어 있지 않은 module ex)UsersModule
// 2. dynamic module -> 설정이 되어 있는 module ex)forRoot
// dynamic module은 결과적으로 static module이 된다.
// dynamic module은 중간과정이다. 설정을 조작해주어야 하기에

// dynamic module을 만들어보고 여러 옵션을 적용한 후 리턴 값으로 우리가 설정한 옵션들이 존재하는 상태의 static module을 내보내는 것!