import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dish } from "src/restaurants/entites/dish.entity";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order, OrderStatus } from "./entities/order.entity";


@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant) // module에 추가
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes : Repository<Dish>
    )
    {}

    async createOrder(
        customer: User, // login 및 customer
        {restaurantId,items}: CreateOrderInput
    ) : Promise<CreateOrderOutput> {
       try {
            // restaurant 찾기
        const restaurant = await this.restaurants.findOne(restaurantId) // restaurants repo 생성 후
        if(!restaurant) {
            return {
                ok:false,
                error:"Restaurant not found"
            }
        }

        let orderFinalPrice = 0; // 모든 dish의 총 합계
        const orderItems: OrderItem[] = [];
      
        for(const item of items) { // order에서 각각의 item을 orderitem으로 만들기(objectitem을 위한 repo 생성)
            // CreateOrderInput으로 받은 각 item을 OrderItem으로 만들기
            // dishId에 해당하는 dish만 체크 -> dish찾기(dish repo 생성) repo 생성시 modules에 추가 잊지 말 것!
            const dish = await this.dishes.findOne(item.dishId)
            if(!dish) { // dish를 찾지 못하면 orderItem 만드는 작업 전부 취소
                // abort this whole thing
                return { // return이 forEach 안에 있어 return 안됨 => for of loop 사용
                    ok:false,
                    error:"Dish not found"
                }
            }
            let dishFinalPrice = dish.price;
            // 찾은 모든 extra 가격을 dishFinalPrice에 추가

            // dish에서 프로퍼티 가져오기
            // db에 있는 dish를 찾아서 유저가 보낸 옵션이 있는지 확인
            // 각각 dish의 최종가격을 계산(for문 안에 있기에)
            for(const itemOption of item.options) {                                            
                    const dishOption = dish.options.find(  // ↓ DB에서 보낸 옵션
                        dishOption => dishOption.name === itemOption.name)
                                          // ↑ 유저가 보낸 옵션
                if(dishOption) { // dishoption을 찾는다면 dishoption.extra를 출력
                    if(dishOption.extra) {
                        dishFinalPrice = dishFinalPrice + dishOption.extra;
                    } else { // dish 옵션 extra가 없다면 dish 옵션의 choice를 봐야함
                        const dishOptionChoice = dishOption.choices.find( // parent는 spice level / size    
                            optionChoice => optionChoice.name === itemOption.choice
                            )
                        if(dishOptionChoice) {
                            if(dishOptionChoice.extra) {
                                dishFinalPrice = dishFinalPrice + dishOptionChoice.extra; // 백엔드에서 계산
                            }
                        }
                    }
           
                }
            }                                    
            orderFinalPrice = orderFinalPrice + dishFinalPrice
            // dishFinalPrice 값을 orderFinalPrice에 더함.



            // dish를 찾았다면? orderItem에 dish, items를 넣을 수 있다.
            const orderItem = await this.orderItems.save(this.orderItems.create({
                dish,
                options: item.options // item 내부의 options... total 계산해주어야 함
            })) 
            // input 내부의 items에 대해 dish를 찾음
            // db에서 가져온 dish와 위의 options를 이용해 orderItem을 생성
            // dish와 option으로 모든 orderItem 생성하고 만들어진 orderItem을 orderItem array로 푸쉬
            orderItems.push(orderItem)
        } 
        // item 생성
        // order 생성
        // order에 item 넣기
        await this.orders.save(this.orders.create({
            customer,
            restaurant,
            total:orderFinalPrice,
            items:orderItems // 최종 (relation M:N )
        }))
        return {
            ok:true
        } // 추후 주문서 추가(유저가 볼 수 있는)
       } catch {
           return {
               ok:false,
               error:"Could not create order"
           }
       }
    }
    // 누가 요청하는지 알아야함, 필터로 사용하는 GetOrdersInput 
    async getOrders(user: User, {status}: GetOrdersInput) : Promise<GetOrdersOutput> {
        try {
            let orders: Order[]
        // 유저의 role 가져오기
        if(user.role === UserRole.Client) {
            // client면 주문 찾기
            orders = await this.orders.find({ 
                where: {
                    customer: user,
                    // ...(status && {status}) 을 하지 않으면 status의 조건을 주지 않으면 order를 보내주지 않음
                    // 어떠한 status를 보내지 않으면 모든 order를 볼 수 있음
                    // status를 어떤 조건으로 하느냐에 따른 해당 order를 볼 수있음
                    ...(status && {status}) // obj에 조건부로 프로퍼티를 추가할 수 있음
                    }
                })
        } else if(user.role === UserRole.Delivery) {
            orders = await this.orders.find({ 
                where: {
                    driver: user,
                    ...(status && {status})
                    }
                })
        } else if(user.role === UserRole.Owner) {
            // owner가 user인 모든 restaurant 찾기
            const restaurants = await this.restaurants.find({ 
                where: {
                   owner: user
                    },
                    // relations load .. restaurant을 load하는 것이 아니라 orders만 load
                    relations:["orders"]
                })
            
            orders = restaurants.map(restaurant => restaurant.orders).flat(1);
            
            // orders 만 가진 array 갖게 됨
            // 하지만 order를 찾기 원하는거지 order가 들어있는 array를 원하는 것이 아니기에
            // map을 사용해서 각 restaurant에서 orders를 가져옴(map은 restaurant.orders array를 하나씩 꺼내줌)
            // 그렇기 되면 큰 array에 각 restaurant의 order가 array 형태로 담기게 되고 만약 order가 없는 경우는 빈 array로 출력됨
            // flat을 여기서 사용하게 되면 빈 array의 문제를 해결 할 수 있음
            
            // flat은 내부 array의 모든 요소를 외부로 가져온다
            // 내부에 많은 array를 가진 array가 있다면 flat 사용!

            // Filtering
            if (status) {
                orders = orders.filter(order => order.status === status); // filter는 조건을 충족하지 못하는 요소를 제거
                // 어떠한 status를 보내지 않으면 모든 order를 볼 수 있음
                // status를 어떤 조건으로 하느냐에 따른 해당 order를 볼 수있음
            }
        }
        return {
            ok:true,
            orders,
        }
        } catch {
            return {
                ok:false,
                error:"Could not get orders"
            }
        }
    }

    canSeeOrder(user: User, order: Order):boolean {
        let canSee = true;
        if(user.role === UserRole.Client && order.customerId !== user.id) {
            canSee = false;
        }
        if(user.role === UserRole.Delivery && order.driverId !== user.id) {
            canSee = false;
        }
        if(
            user.role === UserRole.Owner && 
            order.restaurant.ownerId !== user.id
            ) {
                canSee = false;
            }
            return canSee
    }

    async getOrder(user:User, {id: orderId} : GetOrderInput) : Promise<GetOrderOutput> {
       try {
            // order 찾기
        const order = await this.orders.findOne(orderId,{
            relations:['restaurant'] // customer와 driver는 relation load X(id 보다는 owner가 필요하기에)
            // relation을 load하지 않고 id를 확인하려면 RelationId column 생성 ... order.entity
        });
        if(!order) {
            return {
                ok:false,
                error:"Order not found."
            }
        }
        
        if(!this.canSeeOrder(user, order)) {
            return {
                ok:false,
                error:"You cant see that"
            }
        }
        return { // 위 두가지 조건을 모두 만족했을 시
            ok:true,
            order
        }
       } catch {
           return {
               ok:false,
               error:"Could not load order."
           }
       }
    }

    async editOrder(user: User, {id:orderId, status}: EditOrderInput) : Promise<EditOrderOutput> {
      try {
            // order 가져오기
        const order = await this.orders.findOne(orderId, {
            relations:['restaurant']})
        if(!order) {
            return {
                ok:false,
                error:"Order not found"
            }
            // 유저가 배달원/식당주인/고객 인지 체크
        }
        if(!this.canSeeOrder(user,order)) {
            return {
                ok:false,
                error:"Can't see this."
            }
        }
        let canEdit = true;
        // defense programming
        if(user.role === UserRole.Client) { // 유저가 client일 시 수정 X
            canEdit = false;
        }
        if(user.role === UserRole.Owner) { // role 체크
            if(status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) { // status 체크
                // order 업데이트
                canEdit = false;
            }
        }
        if(user.role === UserRole.Delivery) {
            if(status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                canEdit = false;
            }
        }
        if(!canEdit) {
            return {
                ok:false,
                error:"You can't do that."
            }
        }
        // 오류가 생기지 않는다면? 업데이트
        await this.orders.save([{ // entity
            id : orderId, // orderId
            status // status
        }])
        return {
            ok:true
        }
      } catch {
          return {
              ok:false,
              error:"Could not edit order."
          }
      }
    } 
}





// 컨스트럭터에 Order를 위한 injectRepo
