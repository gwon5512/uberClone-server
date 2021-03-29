import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";

@Injectable() // 잊지 말기!!

export class UsersService {
    constructor(

        @InjectRepository(User) private readonly users: Repository<User>, // User entity의 InjectRepository 불러오기
        // dependency injection (원하는 것의 class만 적어주면 nestjs에서 그 정보를 가져다준다)
        private readonly jwtService:JwtService // class 타입(jwtService) 만 보고 찾아줌
        ) {}                                    // type이 Repository이고 Repository type 은 User entity가 된다


        async createAccount({email, password, role}: CreateAccountInput) : Promise<{ok:boolean,error?:string}> { // boolean과 string을 가지는 array리턴 string은 가질 수도 안 가질 수도 있다.
            try {                                                                   // array 출력 과 object 출력 모두 가능하다!
                    // user가 존재하는지 email로 확인
                    const exists = await this.users.findOne({email})
                    if( exists ) { // 존재한다면?
                        return { ok:false, error:'There is a user with that email already' };// error return => throw Error() 도 가능!
                    }  // 첫 번째 ok는 false, 두 번째 '~~' 
                    // 존재하지 않는다면 계정 생성 및 저장(instance 생성 및 user를 저장)
                    await this.users.save(this.users.create({email, password, role})); // create(entity만 생성할 뿐)와 save(DB에 저장)는 다른 개념이다 유의!! -> entity를 저장하기 전 까지는 password 생성 X .. 후에 저장
                    // throw new InternalServerErrorException 를 catch ↑
                    return { ok:true }  
            } catch(e) {
                // 에러 생성 -> 에러가 있다면?
                return { ok:false, error:"Couldn't create account" };
            } // ok boolean의 값으로 false, error 로 '~~' 을 return
        }  // 이 파일은 전반적으로 Error 를 다룬다

        async login({email, password} : LoginInput) : Promise<{ok:boolean,error?:string, token?:string}> {
        // 1. 이메일을 가진 유저 찾기
        try {
            const user = await this.users.findOne({email})
            if(!user) {
                return {
                    ok:false,
                    error:'User not found',                    
                }
            }
        // 2. 비밀번호 확인 -> user가 준 password를 가지고 hash 한 후 DB 에 있는 것(hash 된 상태)과 비교
            const passwordCorrect = await user.checkPassword(password) // 37번 줄 선언한 user와 다르다 이 것은 user entity
            if( !passwordCorrect ) {
                return {
                    ok:false,
                    error : 'Wrong password'
                }
            }
            
            // const token = jwt.sign({id:user.id, password:'12345'},this.config.get('SECRET_KEY')) // this.config.get('SECRET_KEY') =  process.env.SECRET_KEY
            const token = this.jwtService.sign(user.id) // user Id 만 암호화 여기서만 사용할 것이기에
// app.module에서 module을 설치/설정하고 users.module 에서 configService 요청하게 되면 nestjs가 이미 configModule의 존재를 인지하고 필요한 정보를 전달해 준다. 
// 그저 users.service의 constructor 에서 요청만 해주면 된다.

            return { // 맞다면
                ok:true,
                token // 사용자들에게 줄 json을 지정해야 한다 -> 가짜 token을 구별하기 위해
            }
        } catch(error) {
            // 어떤 error 라도 있으면 그 어떤 error 든 뭔가를 return
            return {
            ok:false,
            error
            }
        }
        // 3. JWT 생성 후 유저에게 전송
        // 토큰 만드는 방법 1. 전부 수작업 하는 방법(token generation 작동 -> 모듈로 적용) 2. nestjs/passports 적용 후 passport-jwt와 nestjs/jwt 활용 방법

     

    }
    async findById(id:number) :Promise <User> { // id로 user를 찾는 로직 작성
        return this.users.findOne({id})
    }
}  // npm i jsonwebtoken (js전용)
// npm i @types/jsonwebtoken --only-dev (타입전용)
// const token = jwt.sign({ 원하는 데이터 }), privateKey(process.env에서 가져오게 로직작성), {algorithm: '알고리즘명'}
// token을 user에게 지정해주면 user는 자기 token 안에 뭐가 들어 있는지 볼 수 있다. 자신의 token에 들어있는 암호를 해독할 수 있다
// 그렇기에 중요한 개인정보는 넣지 말아야한다. ID 정도의 정보가 적당함.
// privateKey 를 이용하는 이유는 사용자가 token을 수정했는지 확인 가능하기 때문
// env 에 있는 secret_key는 https://randomkeygen.com/ 참조(256-bit) 
// 사용자들에게 줄 json을 지정해야 한다 -> 가짜 token을 구별하기 위해
// https://jwt.io/ 에서 token을 붙여넣기해서 해당 정보를 전부 볼 수 있다. -> 누구든지 token에 대한 정보를 알 수 있다. 그렇기에 중요한 정보는 No!
// JWT의 목적은 비밀유지가 아니다! -> 우리 만이 유효한 인증을 할 수 있게 하는 것이 목적이다!(진위여부... 누가 수정을 한 것은 아닌지?)