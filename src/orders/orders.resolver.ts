import { Inject } from "@nestjs/common";
import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { CreateDishOutput } from "src/restaurants/dtos/create-dish.dto";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";


// const pubsub = new PubSub() 
// 인스턴스 생성... 전체 애플리케이션에서 하나여야 한다. 다른 resolver에선 사용 못하기에 => global로 해결


@Resolver(of => Order)
export class OrderResolver {
    // constructor에 service import
    constructor(
        private readonly ordersService:OrderService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub // dependency injection을 사용하면 애플리케이션에 원하는 것을 provide 할 수 있다.
        ) {} // 생성시 모듈에 넣기!

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

    @Subscription(returns => Order,{
        // filering -> 해당 owner의 restaurant에 생성된 새로운 order만 보기위해
        // order가 만들어진 restaurant이 context.User의 restaurant인지 확인(owner id 확인)
        filter:({pendingOrders:{ownerId}}, _, {user}) => { // filter는 true or false return
            // context는 token, user -> user.id subscription을 listening하는지 알 수 있음
            return ownerId === user.id
            // true시 subscription을 listening하고 있는 유저가 order를 볼 수 있음
        },
        resolve:({pendingOrders:{order}}) => order // payload 필요
    })
    @Role(['Owner'])
    pendingOrders() {
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER) // trigger는 string - common.constants에 작성
    } // 새로운 order를 만들면 NEW_PENDING_ORDER 발생

    @Subscription(returns => Order)
    @Role(['Delivery'])
    cookedOrders() {
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
    } // editOrder에 의해 trigger

    @Subscription(returns => Order,{
        filter:(
            {orderUpdates:order}:{orderUpdates:Order},
            {input}:{input:OrderUpdatesInput},
            {user}:{user:User}
            ) => {
            // order에 관련된 유저(owner,customer,driver)들이 이 subscription을 listening 할 수 있도록
            if(order.driverId !== user.id && 
               order.customerId !== user.id &&
               order.restaurant.ownerId !== user.id
                ) { // order가 eager relation과 같이 load 되기 때문에 restaurant.ownerId 사용가능
                    return false
                }
            return order.id === input.id
        } // 유저에 관련된 사람들만 order의 update를 볼 수 있다.
    })
    @Role(['Any']) // orderUpdates subscription 모두 listening
    orderUpdates(@Args('input') orderUpdatesInput:OrderUpdatesInput) {
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE)
    }

    // delivery driver를 order에 등록하는 역할
    @Mutation(returns => TakeOrderOutput)
    @Role(['Delivery'])
    takeOrder(
        @AuthUser() driver:User, 
        @Args('input') takeOrderInput : TakeOrderInput
        ) : Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver, takeOrderInput)
    }

}

// filtering을 하는 이유는 모든 update를 listen 할 필요가 없기에(해당부분만 update)
// 우리가 원하는 event만 publish


// @Mutation(returns => Boolean) // 이 상황에선 db에 접근하지 않음 -> db에 저장하지 않고 pubsub에 push
// async potatoReady(@Args('potatoId') potatoId:number) {
//     await this.pubSub.publish('hotPotatos', {readyPotato:potatoId}) 
//     // 트리거 이름은 pubsub.asyncIterator(인자값)과 같으면 되고, payload는 obj...해당 Mutation 함수의 이름과 같다.
//     return true
// } // 트리거에 publish하는 서버

// @Subscription(returns => String,{
//     filter:({readyPotato}, {potatoId}) => { // filter는 현재 listening하는 사용자가 update 알림을 받아야하는지 유무를 결정 -> 조건 만족시 true return
//         // payload : ex) readyPotato:~~ 문자열을 가진 obj
//         // resolve의 variables : listening을 시작하기전에 subscription에 준 variables를 가진 obj
//         // context : token, req, user... 나머지 모든 것
//         return readyPotato === potatoId // true 라면 update 알림 받음
//     },
//     resolve:({readyPotato}) =>  // resolve는 사용자가 받는 update 알림의 형태를 바꿔주는 역할
//     `Your potato with the id ${readyPotato} is ready!` // resolve는 subscription이 알려야 하는 것은 return(output의 변형역할).. 즉,asyncIterator
    
// })
// @Role(['Any']) // 사용자(listening)
// readyPotato(@Args('potatoId') potatoId:number) {
//     return this.pubSub.asyncIterator('hotPotatos') // trigger는 우리가 기다리는 이벤트를 뜻함
// } // 트리거를 listening하는 서버
 // 동일한 pubsub이 아닌 경우 작동하지 X