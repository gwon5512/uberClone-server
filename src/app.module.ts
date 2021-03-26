import { Module } from '@nestjs/common';
import * as Joi from 'joi'; // js 나 nest.js로 되어 있지 않은 패키지를 불러오는 법 * as 를 해주지 않으면 undefined로 결과 값이 나온다 - export 된 것이 아니기 때문에
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from "path";
import { RestaurantsModule } from './restaurants/restaurants.module';  //자동 import
import { Restaurant } from './restaurants/entites/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ // dotenv 최상위에서 실행 // npm i --save @nestjs/config  // npm i cross-env 가상변수설정가능하게해줌(어느환경에서든 win||os||linux)
      isGlobal: true, // 애플리케이션 어디서나 config 모듈 접근 가능
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" :".env.test", // env 파일 read // dev가 아니면 test
      ignoreEnvFile: process.env.NODE_ENV === "prod", // 서버 deploy시에 환경 변수 파일을 사용하지 않는다는 의미 -> prod 일 때만 true (배포 환경시에는 configmodule이 환경변수 무시)
      validationSchema: Joi.object({ // 환경변수의 유효성 검사 joi(데이터 유효성 검사 툴) // npm i joi
        NODE_ENV:Joi.string().valid('dev','prod').required(), // valid 안에 유효한 값을 준다
        DB_HOST : Joi.string().required(), // 스키마의 유효성 검사!
        DB_PORT : Joi.string().required(),
        DB_USERNAME : Joi.string().required(),
        DB_PASSWORD : Joi.string().required(),
        DB_NAME: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({ // connection option 작성  //npm install --save @nestjs/typeorm typeorm pg
      type: 'postgres', // 1. option 코드에 바로 작성하거나 2.ormconfig.json파일에 작성하거나
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, // default로 string으로 정해져 있지만 typeorm의 설정옵션은 port가 number여야 한다 '+' 입력!
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== "prod",  // DB에 현재 상태로 자동 마이그레이션 유무 / 수동 (prod 가 아니면 true)
      logging: process.env.NODE_ENV !== "prod", // DB에서 어떠한 일이 일어나는 console 표시
      entities:[User] // Typeorm에 우리가 만든 엔티티가 어디 있는지 알려주는 역할 1 => 새로운 엔티티를 더하는 것을 잊지 말것!!!
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true //자동생성 세팅
    }),
    UsersModule,
    CommonModule  //내가 추가한 모듈 nest g mo "모듈명"
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
