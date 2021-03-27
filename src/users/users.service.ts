import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";

@Injectable() // 잊지 말기!!

export class UsersService {
    constructor(

        @InjectRepository(User) private readonly users: Repository<User> // User entity의 InjectRepository 불러오기
    ) {}                                            // type이 Repository이고 Repository type 은 User entity가 된다


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
        }

}  // 이 파일은 전반적으로 Error 를 다룬다