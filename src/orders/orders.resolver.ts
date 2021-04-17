import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";


const pubsub = new PubSub() // 인스턴스 생성


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

    @Query(returns => GetOrderOutput)
    @Role(['Any'])
    async getOrder(
        @AuthUser() user: User, // 누가 요청했는지에 따라 각기 다른 Orders를 보게 됨
        @Args("input") getOrderInput : GetOrderInput 
    ) : Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput)
    }

    @Mutation(returns => EditOrderOutput)
    @Role(['Any'])
    async editOrder(
        @AuthUser() user: User, 
        @Args('input') editOrderInput : EditOrderInput
        ) : Promise <EditOrderOutput> {
            return this.ordersService.editOrder(user, editOrderInput)
    }


    // subscription은 resolver에서 변경 사항이나 업데이트를 수신 할 수 있게 해준다.
    // subscription은 규칙이 있는데 무엇을 return 하는지에 따라 정해진다.
    // npm i graphql-subscriptions -> 설치 한 후 인스턴스 생성(pubsub)
    // pubsub을 통해 app 내부에서 메시지를 교환
    // installSubscriptionHandlers:true 추가 app.module에서
    // web 소켓에는 req가 없음(오류원인중 하나) -> 웹 소켓 프로토콜 필요
    
    @Mutation(returns => Boolean)
    potatoReady() {
        pubsub.publish('hotPotatos', {readyPotato:"Your potato is ready. Love you"}) 
        // 트리거 이름은 pubsub.asyncIterator(인자값)과 같으면 되고, payload는 obj...해당 Mutation 함수의 이름과 같다.
        return true
    }

    @Subscription(returns => String)
    @Role(['Any'])
    readyPotato(@AuthUser() user: User) {
        console.log(user)
        return pubsub.asyncIterator('hotPotatos') // trigger는 우리가 기다리는 이벤트를 뜻함
    }
} 