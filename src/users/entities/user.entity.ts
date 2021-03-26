import { ObjectType, InputType, Field, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity } from "typeorm";


// type UserRole = 'client' | 'owner' | 'delivery' // 타입의 경우가 있는 경우 다음과 같이 설정할 수 있음

enum UserRole { // 열거하다... enum 이라고 불리는 object
    Client,  //0
    Owner,   //1
    Delivery //2 => ex) DB 내에서도 UserRole로 2를 가진다... 다른 것으로도 표현 가능함
}

registerEnumType(UserRole,{name:'UserRole'})// grapthQL enum 설정 -> grapthQL 사용시 인자는 문자(string)가 아니다

@InputType({isAbstract:true}) // 잊지 말기!! 유의
@ObjectType() // graphQL object 생성
@Entity()
export class User extends CoreEntity { // 기본 중복되는 엔티티의 컬럼을 불러올 수 있다
    
    @Column()
    @Field(type => String) // GraphQL 위해
    email:string;

    @Column()
    @Field(type => String)
    password:string;

    @Column({ type:'enum', enum:UserRole}) // enum 세팅확인 (DB)
    @Field(type => UserRole) // graphQL 세팅
    role: UserRole;
}