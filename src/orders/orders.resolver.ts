import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";


@Resolver(of => Order)
export class OrderResolver {
    // constructor에 service import
    constructor(private readonly ordersService:OrderService) {} // 생성시 모듈에 넣기!

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"]) // client만 주문가능
    async createOrder(@AuthUser() customer:User, @Args('input') createOrderInput:CreateOrderInput) : Promise<CreateDishOutput> {
    // ↑ customer가 누구인지 알아야함
    return this.ordersService.createOrder(customer,createOrderInput)
    }

    @Query(returns => GetOrdersOutput)
    @Role(['Any'])
    async getOrders(
        @AuthUser() user: User, // 누가 요청했는지에 따라 각기 다른 Orders를 보게 됨
        @Args("input") getOrdersInput : GetOrdersInput 
    ) : Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput)
    }
} 