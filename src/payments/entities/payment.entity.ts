import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";



@InputType('PaymentInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class Paymnet extends CoreEntity {

    @Field(type => String) // graphql
    @Column() // db
    transactionId: string;

    // payment는 user가 있고 user는 많은 payment가 있다.
    @Field(type => User)
    @ManyToOne(
        type => User,
        user => user.payments
    )
    user: User;

    @RelationId((payment: Paymnet) => payment.user)
    userId: number;

    // 유저가 여러개의 restaurant을 소유 할 수 있기에
    // 유저는 여러 restaurant 중 홍보하고 싶은 곳을 선택해야 함
    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant)
    restaurant: Restaurant;
    // one to many는 many to one 없이 존재할 수 없다.
    // many to one에 관계만 집중하고 싶다면 관련 entity에 one to many없이 정의가능!!!
    // (restaurant entity payments는 사용할 필요가 없기에)

    @Field(type => Int)
    @RelationId((payment:Paymnet) => payment.restaurant)
    restaurantId: number;

}