import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dish } from "src/restaurants/entites/dish.entity";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order } from "./entities/order.entity";


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
}
// 컨스트럭터에 Order를 위한 injectRepo

