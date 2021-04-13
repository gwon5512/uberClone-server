import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";


@InputType()
export class CreateOrderInput extends PickType(Order,["items"]) {
    // 주문한 restaurant가 어딘지 나타내는 restaurantId
    @Field(type => Int)
    restaurantId: number;
}



@ObjectType()
export class CreateOrderOutput extends CoreOutput {

}