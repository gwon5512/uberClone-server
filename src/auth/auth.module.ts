import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
    imports:[UsersModule],
    providers:[{
        provide:APP_GUARD, // 입력값이 없지만 APP_GUARD를 사용함으로써 nest는 모든 resolver를 실행하기전에 AuthGuard 실행<Global>
        useClass:AuthGuard // 그렇기에 로그인하지 않은 상태에서는 createAccount 조차되지 않음
    }]
})
export class AuthModule {} // $ nest g mo auth

// guard를 모든 곳에서 사용하고 할 때 APP_GUARD사용
// app.module 추가 잊지 말것!