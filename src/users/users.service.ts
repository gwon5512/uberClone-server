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


        async createAccount({email, password, role}: CreateAccountInput) : Promise<string | undefined> {
            try {
                    // user가 존재하는지 email로 확인
                    const exists = await this.users.findOne({email})
                    if( exists ) { // 존재한다면?
                        return 'There is a user with that email already';// error return => throw Error() 도 가능!
                    }
                    // 존재하지 않는다면 계정 생성 및 저장(instance 생성 및 user를 저장)
                    await this.users.save(this.users.create({email, password, role})); // create와 save는 다른 개념이다 유의!!
                    // return true; (계정 만드는 부분 성공시에 return을 굳이 해줄 필요 없음)
            } catch(e) {
                // 에러 생성 -> 에러가 있다면?
                return "Couldn't create account";
            }
        }

}