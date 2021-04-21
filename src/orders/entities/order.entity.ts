import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entites/dish.entity";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    Pending = "Pending", // 주문대기상태(pending)
    Cooking = "Cooking", // 조리
    Cooked = "Cooked", // 픽업을 기다리고 있는 상태
    PickedUp = "PickedUp",
    Delivered = "Delivered" // 배달완료
}

registerEnumType(OrderStatus, {name:"OrderStatus"})

@InputType("OrderInputType",{isAbstract : true})
@ObjectType()
@Entity()

export class Order extends CoreEntity {

    @Field(type => User, {nullable:true}) // graphql                                 // ↓ eager relation
    @ManyToOne(type => User, user => user.orders, {onDelete:'SET NULL',nullable:true, eager:true}) // 많은 order는 한명의 user 가짐
    customer?: User // typescript                    // ↑ user 삭제시에도 order지워지지 않음

    @RelationId((order: Order) => order.customer)
    // 어떤 relation을 만들지
    customerId: Number
  
    @Field(type => User,{nullable:true}) // graphql .. 주문시 아직 배정된 driver가 없기 때문에
    @ManyToOne(type => User, user => user.rides, {onDelete:'SET NULL',nullable:true, eager:true}) // 픽업 시
    driver?: User // typescript

    @RelationId((order: Order) => order.driver)
    // 어떤 relation을 만들지
    driverId: Number

    @Field(type => Restaurant, {nullable:true}) // graphql
    @ManyToOne(
        type => Restaurant, 
        restaurant => restaurant.orders, // 반대쪽에서 접근하고 싶을 때만 작성
        {onDelete:'SET NULL',nullable:true, eager:true}) // 하나의 order는 하나의 restaurant을 가짐??????
    restaurant?: Restaurant // typescript

    @Field(type => [OrderItem]) // graphql
    @ManyToMany(type => OrderItem,{eager:true})
    // 조인테이블은 소유하고 있는 쪽의 relation에 추가
    // order는 어떤 dish를 고객이 선택했는지 알 수 있다.
    // 우리는 dish가 얼마나 많은 order를 받았는지 알 필요가 없지만 order로부터 몇 개의 dish를 주문했는지 알아야함
    // => order는 많은 orderitem을 가짐
    @JoinTable()
    items: OrderItem[] // typescript ... dish는 user가 고른 option도 필요... 그 option을 저장하는 것이 OrderItem을 만들어줌

    @Column({nullable:true}) // typeorm
    @Field(type => Float,{nullable:true}) // graphql ... 백원단위
    @IsNumber()
    total?: number // typescript

    @Column({type:'enum', enum:OrderStatus, default:OrderStatus.Pending}) // typeorm 
    @Field(type => OrderStatus) // graphql
    @IsEnum(OrderStatus)
    status: OrderStatus // typescript

    


}