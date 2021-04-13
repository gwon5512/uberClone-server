import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";


@Resolver(of => Order)
export class OrderResolver {
    // constructor에 service import
    constructor(private readonly orderService:OrderService) {} // 생성시 모듈에 넣기!

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"]) // client만 주문가능
    async createOrder(@AuthUser() customer:User, @Args('input') createOrderInput:CreateOrderInput) : Promise<CreateDishOutput> {
    // ↑ customer가 누구인지 알아야함
    return {
        ok:true,
    }
    }
} 