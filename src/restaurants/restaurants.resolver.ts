
import { Args,ArgsType,Mutation,Query,Resolver } from "@nestjs/graphql";
import { createRestaurantDto } from "./dtos/create-restaurants.dto";
import { Restaurant } from "./entites/restaurant.entity"
import { RestaurantService } from "./restaurants.service"; // repository를 사용하기 위해 service를 resolver에 import


@Resolver( of => Restaurant) //Restaurant 테이블의 resolver
export class RestaurantsResolver {
    constructor(private readonly restaurantService : RestaurantService) {} // repository를 사용하기 위해 service를 resolver에 import -> this.restaurantService.getAll()을 return
    // @Query( returns =>Boolean) //graphql 있어야함 무조건
    // isPizzaGood() : Boolean { //typescript
    //     return true;
    // }
    @Query(returns => [Restaurant]) //restaurants 의 빈배열로 리턴  GraphQL 문법
    restaurants(): Promise<Restaurant[]> {  // ts 문법
        return this.restaurantService.getAll(); // server 파일에서 사용한 find는 async 메소드이기에 Promise 사용
         //graphQL          //function 
    } // repository를 사용하기 위해 service를 resolver에 import -> this.restaurantService.getAll()을 return
    @Mutation(()=> Boolean)  // CUD
    createRestaurant(
        @Args() createRestaurantDto:createRestaurantDto
    ) : Boolean {
        return true;
    }

}