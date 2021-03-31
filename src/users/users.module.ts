import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';


@Module({ // module이 글로벌(IsGlobal) 설정 시 imports에 적을 필요 없다.
   imports: [TypeOrmModule.forFeature([User,Verification])], //ConfigService jwt 관련 -- 우리가 원하는 것을 불러올 수 있다
   providers:[UsersResolver, UsersService],
   exports: [UsersService]
})
export class UsersModule {
    
}  // $nest g mo users
