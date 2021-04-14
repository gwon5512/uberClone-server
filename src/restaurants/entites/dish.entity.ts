import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";



@InputType("DishChoiceInputType", {isAbstract:true})
@ObjectType()
export class DishChoice { // choice가 주문의 값을 변경할 수 있기에 생성
    @Field(type => String)
    name: string;
    @Field(type => Int, {nullable: true})
    extra?: number;
}

@InputType("DishOptionInputType", {isAbstract : true})
@ObjectType()
export class DishOption {
    @Field(type => String)
    name: string;

    @Field(type => [DishChoice],{nullable: true})
    choices?: DishChoice[]; // 꼭 필요한 것은 아님

    @Field(type => Int, {nullable:true})
    extra?: number; // 꼭 필요한 것은 아님
}


@InputType("DishInputType", {isAbstract : true})
@ObjectType()
@Entity()
export class Dish extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => Int)
    @Column()
    @IsNumber()
    price: number;

    @Field(type => String, {nullable: true})
    @Column({nullable: true})
    @IsString()
    photo: string;

    @Field(type => String)
    @Column()
    @Length(5, 140)
    description: string

    //relationship : Restaurant은 많은 dish를 가지고, dish는 한 개의 Restaurant 가짐
    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, restaurant => restaurant.menu,{onDelete:'CASCADE'}) // 식당에는 반드시 음식이 있어야 함 null 허용X
    restaurant: Restaurant;                                       // ↑ Restaurant 삭제시 dish 전부 삭제

    @RelationId((dish : Dish) => dish.restaurant) // relationship 전부를 load하지 않기위해... restaurant의 ID만
    restaurantId: number;

    @Field(type => [DishOption], {nullable: true})
    @Column({type:"json", nullable: true}) // 기본적으로 json data 저장
    options?: DishOption[] // optional
}
// 구조화된 데이터를 저장하거나 특정 형태를 가진 데이터를 저장할 때 json type 사용


// 옵션 구축 방법
// 1. dish option이라는 entity 생성 및 관계구축
// 2. ObjectType 생성 후 이 것을 json에 전부 저장