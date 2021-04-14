// 우리는 user가 원하는 dish와 user가 choice한 프로퍼티 저장
// dishoption을 저장하는 더 좋은방법

import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish, DishChoice } from "src/restaurants/entites/dish.entity";
import { Column, Entity, ManyToOne } from "typeorm";


@ObjectType()
@InputType("OrderItemOptionInputType", {isAbstract : true})
@ObjectType()
export class OrderItemOption {
    @Field(type => String)
    name: string;

    @Field(type => String,{nullable: true}) // 꼭 필요한 것은 아님
    choice?: String; // 한개의 string인 choice필요
}

@InputType('OrderItemInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity{
    @Field(type => Dish)
    // orderitem은 1개의 dish를 가짐... dish는 여러 item을 가짐
    @ManyToOne(type => Dish, {nullable:true, onDelete:'CASCADE'})
    // manytoone에서는 dish에서 어떻게 orderitem을 가져올지 신경쓰지 않아도 된다(항상 반대의 관계에서 어떻게 되는지 명시해줄 필요X)
    // dish 쪽에서 orderitem에 접근하지 않아도됨
    dish: Dish
    
    @Field(type => [OrderItemOption],{nullable:true})
    @Column({type:'json',nullable:true})
    options?: OrderItemOption[] // options는 order가 생성되고 완료 될 때 한번에 저장 
    // json 대신에 DishOption을 엔티티의 relationship으로 생성 할 수도 있지만
    // 옵션의 삭제/추가 부분에서 문제가 발생(이전 주문에도 영향) => json으로 해결(추후에 옵션을 수정해도 문제X)

}