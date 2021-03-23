import { Field, ObjectType } from "@nestjs/graphql";
import { type } from "node:os";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType() // 자동으로 스키마를 빌드하기 위해 사용하는 graphql 데코레이터
@Entity() // TypeORM이 DB에 해당 엔티티를 저장하게 하는 역할

export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;

    @Field(type => String)
    @Column()
    name : string;

    @Field(type => Boolean, {nullable:true}) // 아니면! 들어감
    @Column()
    isVegan?: boolean

    @Field(type => String)
    @Column()
    address: string

    @Field(type => String)
    @Column()
    ownerName: string

    @Field(type => String)
    @Column()
    categoryName: string

}