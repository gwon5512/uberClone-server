import { Field } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


// 기본적으로 공유되는 것들을 모두 적용(베이스로 들어가는 것들(중복))
export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Field(type => Number) // graphQL 위해 (graphQL 타입) -> 타입들을 넣어주게 되면 DTO를 만들어줄 수 있다!! 그리고 resolver 에서 Mutation 생성시작!
    id: number;

    @CreateDateColumn() // entity를 만들었을 때 자동으로 설정해주는 스페셜 column
    @Field(type => Date)
    createdAt : Date;

    @UpdateDateColumn() // entity를 만들었을 때 자동으로 설정해주는 스페셜 column
    @Field(type => Date)
    updatedAt : Date;
}