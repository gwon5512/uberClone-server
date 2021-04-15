import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order, OrderStatus } from "../entities/order.entity";


// 사람들이 주문을 필터링 할 수 있게
@InputType()
export class GetOrdersInput {
    @Field(type => OrderStatus, {nullable:true}) // 내 모든 주문을 보거나 일부 주문만 볼 수 있다.
    status?: OrderStatus // status와 함께 올 수도? 그렇지 않을 수도 있다.
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
    @Field(type => [Order], {nullable: true}) // 많은 주문들 return
    orders?: Order[] // 종종 주문을 찾고, 그러지 않은 경우도 있음
}