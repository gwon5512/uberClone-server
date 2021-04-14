import { Field, Float, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";



@InputType()
class CreateOrderItemInput {
    @Field(type => Int)
    dishId: number;

    @Field(type => [OrderItemOption], {nullable: true}) // json으로 이뤄진 obj
    options?: OrderItemOption[]
}

@InputType()
export class CreateOrderInput {
    // picktype을 사용하지 않는 이유는 orderitem(dish) 전체를 input으로 하지 않기위해 그렇기에 CreateOrderItemInput 따로생성
    // 주문한 restaurant가 어딘지 나타내는 restaurantId
    @Field(type => Int)
    restaurantId: number;

    @Field(type => [CreateOrderItemInput])
    items: CreateOrderItemInput[]
}



@ObjectType()
export class CreateOrderOutput extends CoreOutput {

}