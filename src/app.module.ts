import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import * as Joi from 'joi'; // js 나 nest.js로 되어 있지 않은 패키지를 불러오는 법 * as 를 해주지 않으면 undefined로 결과 값이 나온다 - export 된 것이 아니기 때문에
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from "path";
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';


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
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required() // token을 지정하기 위해 사용하는 privateKey
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
    GraphQLModule.forRoot({ // ====> dynamic module 결국엔 static module로 세팅해주어야 한다!
      autoSchemaFile: true, //자동생성 세팅
      context:({req}) => ({user:req['user']}) // context 안에 request 프로퍼티 존재... req user 를 공유할 수 있다.
    }),
    JwtModule.forRoot({
      privateKey:process.env.PRIVATE_KEY
    }),
    UsersModule,                             
  //내가 추가한 모듈 nest g mo "모듈명"
  ],
  controllers: [],
  providers: [],
})

// export class AppModule {}


// 어떤 경로에 적용/제외를 시켜줄 지 정할 수도 있다. 전부 적용은 main.ts에서...
export class AppModule implements NestModule { 
  configure(consumer:MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({  // 어떤 routes 에 middleware 를 적용시킬지 정할 수 있다.
      path:'/graphql',           //↑특정 경로만 제외하고 싶을 시 exclude
      method:RequestMethod.POST,
      
    })
  }
}