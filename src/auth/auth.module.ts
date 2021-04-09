import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
    providers:[{
        provide:APP_GUARD,
        useClass:AuthGuard
    }]
})
export class AuthModule {} // $ nest g mo auth

// guard를 모든 곳에서 사용하고 할 때 APP_GUARD사용
// app.module 추가 잊지 말것!