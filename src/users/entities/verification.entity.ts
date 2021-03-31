import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";



@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class Verification extends CoreEntity {  // Verification entity가 오직 한명의 User를 가진다. User도 하나의 Verification 가짐
    
    @Column()
    @Field(type => String)
    code : string // code 값은 무조건 가지고 있어야 하기에 createCode 로직이 필요!! null 이면 안됨

    @OneToOne(type => User, {onDelete:"CASCADE"}) // user 삭제시 같이 붙어있는 verification도 같이 삭제
    @JoinColumn() // 필수(관계를 갖는 것 중 한쪽에 정의한 쪽엔 relation id 포함)
    user:User

    @BeforeInsert()
    createCode() : void { // 다른 곳에서도 verification을 생성할 수 있게 code 생성하는 부분을 넣음
        this.code = uuidv4(); // 이 코드를 email을 통해 내보낼 것
    }
    // Math.random().toString(36).substring(2) 2~36
    // string 은 36으로...

}

// 만약 내가 verification을 얻어 여기로 부터 User에 접근한다면? @JoinColumn()을 verification entity에 추가!(어디로부터 정보를 접근하느냐에 따라 달라짐)