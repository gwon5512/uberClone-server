import { ObjectType, InputType, Field, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from "@nestjs/common";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";
import { Paymnet } from "src/payments/entities/payment.entity";


// type UserRole = 'client' | 'owner' | 'delivery' // 타입의 경우가 있는 경우 다음과 같이 설정할 수 있음

export enum UserRole { // 열거하다... enum 이라고 불리는 object
    Client = "Client",         //0
    Owner = "Owner",          //1
    Delivery = "Delivery"     //2 => ex) 뒤의 문자열이 없으면 DB 내에서도 UserRole로 2를 가진다... 다른 것으로도 표현 가능함
} // DB graphql decorator 에서 사용

registerEnumType(UserRole,{name:'UserRole'})// grapthQL enum 설정 -> grapthQL 사용시 인자는 문자(string)가 아니다

@InputType("UserInputType", {isAbstract:true}) // 잊지 말기!! 유의
@ObjectType() // graphQL object 생성
@Entity()
export class User extends CoreEntity { // 기본 중복되는 엔티티의 컬럼을 불러올 수 있다
    
    @Column({unique:true}) // 중복된 email 체크
    @Field(type => String) // GraphQL 위해
    @IsEmail() // validations
    email:string;

    @Column({select:false}) // 매번 user를 출력 할 때마다 password 포함되지 않게
    @Field(type => String)
    @IsString()
    password:string;

    @Column({ type:'enum', enum:UserRole}) // enum 세팅확인 (DB)
    @Field(type => UserRole) // graphQL 세팅
    @IsEnum(UserRole) // validations
    role: UserRole;

    @Column({default:false})
    @Field(type => Boolean)
    @IsBoolean()
    verified:boolean // user의 email이 verifiy 됐는지 유무를 저장

    @Field(type => [Restaurant]) // restaurant는 항상 user(owner)가 있다. owner는 여러 가지의 restaurant를 가질 수 있다.
    @OneToMany(type => Restaurant, restaurant => restaurant.owner) 
    restaurants: Restaurant[] // user는 restaurant array가 있을 수도 있다.

    @Field(type => [Order]) // user는 많은 order를 가진다.
    @OneToMany(type => Order, order => order.customer) 
    orders: Order[]

    @Field(type => [Paymnet])
    @OneToMany(type => Paymnet, payment => payment.user) 
    payments: Paymnet[]
    
    @Field(type => [Order]) //
    @OneToMany(type => Order, order => order.driver) 
    rides: Order[]

    // hash 는 단방향 함수이다 -> hash 된 비밀번호를 DB에 저장한다(실제 비밀번호는 알 수 없다)
    // listener는 entity에 무슨 일이 생길 때 실행된다 많은 listener가 존재하며 특징에 맞게 사용하면 된다(AfterLoad ... 등)

    @BeforeInsert() // entity가 insert 되기전에 불러주는 listener
    @BeforeUpdate() // 비밀번호 변경 로직 시 해쉬가 되지 않기에 사용
    async hashpassword() : Promise<void> { // 함수명은 임의로 지정가능
        if(this.password) { // save(users.service.ts)로 전달된 obj에 password가 있을 경우만 hash
        try {
        this.password = await bcrypt.hash(this.password, 10) // round 의 default 값은 10... 여기서 password 같은 경우 이미 service 파일에 만들어 둔 것!
        // DB에 저장하기 전에 해당 instance의 password를 받아서 hash 한다
        } catch(e) {
            console.log(e)
            throw new InternalServerErrorException() // error가 있다면... (service 파일 내부에서 catch)
        }
      }
        // $ npm i bcrypt // bcrypt 사용(hash 하는 것과 hash를 확인하는데 모두 사용)
    }   // $ npm i @types/bcrypt --dev-only (types 전용 설치)

    async checkPassword(aPassword:string) : Promise<boolean> { // 유저가 우리에게 준 password를 받음
        try {
          const ok = await bcrypt.compare(aPassword, this.password) // 불러오지못하기에 {select:['password']}  사용 
          return ok;                        // 비교 ↑
        } catch(e) {
            console.log(e)
            throw new InternalServerErrorException() // 만약 어떤 일이 일어나면 
        }
    } 
}