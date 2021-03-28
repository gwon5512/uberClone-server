import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';


@Module({
   imports: [TypeOrmModule.forFeature([User]), ConfigService], //ConfigService jwt 관련 -- 우리가 원하는 것을 불러올 수 있다
   providers:[UsersResolver, UsersService]
})
export class UsersModule {
    
}  // $nest g mo users
