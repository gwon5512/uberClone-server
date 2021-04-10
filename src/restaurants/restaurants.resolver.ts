
import { SetMetadata } from "@nestjs/common";
import { Args,ArgsType,Mutation,Query,Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurants.dto";
import { Restaurant } from "./entites/restaurant.entity"
import { RestaurantService } from "./restaurants.service"; // repository를 사용하기 위해 service를 resolver에 import


@Resolver( of => Restaurant) //Restaurant 테이블의 resolver
export class RestaurantsResolver {
    constructor(private readonly restaurantService : RestaurantService) {} // repository를 사용하기 위해 service를 resolver에 import -> this.restaurantService.getAll()을 return
   
    @Mutation(()=> CreateRestaurantOutput)  // CUD
    // metadata ... data 설정
    // @SetMetadata("role", UserRole.Owner)
    @Role(['Owner']) // Owner 들만 restaurant 생성가능

    async createRestaurant( // async 사용시에는 Promise 와 value를 사용
        @AuthUser() authUser : User, // Restaurant의 owner는 로그인한 유저
        @Args('input') createRestaurantInput:CreateRestaurantInput //input 작성(dto)

    ) : Promise <CreateRestaurantOutput> { // Restaurant가 잘 생성되면 true 아니면 false
            return this.restaurantService.createRestaurant(authUser, createRestaurantInput) 
    }
}