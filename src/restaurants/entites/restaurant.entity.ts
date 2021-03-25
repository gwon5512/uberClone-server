import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { type } from "node:os";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@InputType({isAbstract : true}) // inputType이 스키마에 포함되지 않길 원한다는 의미 -> 어떤 것으로 확장시킨다는 의미 
@ObjectType() // 자동으로 스키마를 빌드하기 위해 사용하는 graphql 데코레이터
@Entity() // TypeORM이 DB에 해당 엔티티를 저장하게 하는 역할

// ↑해준다면 DB에 model을 생성하고 자동으로 graphQL 에 스키마 작성을 할 수 있다.

export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => Boolean, {nullable: true}) // 아니면! 들어감    -> {defaultValue : true} graphQL 스키마에서 이 필드의 defaultValue가 true
    @Column( {default : true})                                                          // -> database에서 이 필드의 defaultValue가 true
    @IsOptional() // 해당 필드를 보내거나 보내지 않을 수 있다는 것을 의미 
    @IsBoolean()  // -> 만약 value가 있다면 boolean이어야 한다
    isVegan: boolean

    // defaultValue 와 nullable의 차이
    // defaultValue 는 정의해주지 않는 이상 따로 입력하지 않아도 defaultValue : true 시에 true 가 출력된다.  defaultValue는 true / false 뿐만 아니라 string 등 어떤 것이든 될 수 있다.
    // nullable : true 시에 nullable 인지 아닌지만 나타낸다 <없어진다?>

    @Field(type => String ,{defaultValue:"강남"}) // => 필드 내용추가!
    @Column()
    @IsString()
    address: string

}


// graphQL database validation 3번 테스트 하는 것 익숙해져야 한다