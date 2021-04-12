import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType("CategoryInputType", {isAbstract : true}) // inputtype이 같은 이름을 사용해주었기에 변경(restaurant, user또한)... DB에서만 인식하는 것이 아닌 graphql과 db가 모두 인식할 수 있게 변경
@ObjectType()
@Entity()
export class Category extends CoreEntity {

    @Field(type => String)
    @Column({unique:true})
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String, {nullable:null}) // category 생성시 이미지를 넣지 않을 수도 있기에
    @Column({nullable: true})
    @IsString()
    coverImg: string;

    @Field(type => String)
    @Column({unique:true})
    @IsString()
    slug: string;

    @Field(type => [Restaurant],{nullable:true}) // ts에서 사용한 array라는 다른 개념 graphql
    // 1:N(하나의 category는 여러 restaurant를 가질 수 있고 restaurant들은 하나의 category를 가진다)
    // 어떤 entity에서 적용되는지
    @OneToMany(type => Restaurant, restaurant => restaurant.category) 
    restaurants: Restaurant[] // 하나의 category는 여러 restaurant를 가질 수 있기에 restaurants 타입 ... 배열형태 또한 같은 맥락
    // category entity가 있는데 field type으로 restaurant array가 있다.  => app.module에서 entity 추가
    // category는 restaurant array가 있을 수도 있다.
}
