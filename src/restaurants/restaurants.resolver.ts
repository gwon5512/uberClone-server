
import { Args,ArgsType,Mutation,Query,Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurants.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurants.dto";
import { Restaurant } from "./entites/restaurant.entity"
import { RestaurantService } from "./restaurants.service"; // repository를 사용하기 위해 service를 resolver에 import


@Resolver( of => Restaurant) //Restaurant 테이블의 resolver
export class RestaurantsResolver {
    constructor(private readonly restaurantService : RestaurantService) {} // repository를 사용하기 위해 service를 resolver에 import -> this.restaurantService.getAll()을 return
   
    @Query(returns => [Restaurant]) //restaurants 의 빈배열로 리턴  GraphQL 문법
    restaurants(): Promise<Restaurant[]> {  // ts 문법
        return this.restaurantService.getAll(); // server 파일에서 사용한 find는 async 메소드이기에 Promise 사용
         //graphQL          //function 
    } // repository를 사용하기 위해 service를 resolver에 import -> this.restaurantService.getAll()을 return 3
    @Mutation(()=> Boolean)  // CUD
    async createRestaurant( // async 사용시에는 Promise 와 value를 사용
        @Args('input') createRestaurantDto:createRestaurantDto //input 작성(dto)
    ) : Promise <boolean> { // Restaurant가 잘 생성되면 true 아니면 false
        console.log(createRestaurantDto)
        try{
            await this.restaurantService.createRestaurant(createRestaurantDto) 
            return true;
        } catch(e) {
            console.log(e)
            return false;
        } 
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto : UpdateRestaurantDto
    ) : Promise<boolean>{ // InputType을 쓴다면 Args에 이름이 있어야 함 하지만 ArgsType을 쓴다면 비워둬야 한다
        try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto)
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }

}