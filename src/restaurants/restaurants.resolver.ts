
import { SetMetadata } from "@nestjs/common";
import { Args,ArgsType,Int,Mutation,Parent,Query,ResolveField,Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurants.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entites/cetegory.entity";
import { Restaurant } from "./entites/restaurant.entity"
import { RestaurantService } from "./restaurants.service"; // repository를 사용하기 위해 service를 resolver에 import
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto"
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Dish } from "./entites/dish.entity";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";


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

    @Mutation(returns => EditRestaurantOutput)
    @Role(["Owner"]) // owner 만 RestaurantOutput 수정가능
    editRestaurant(
        @AuthUser() owner : User,
        @Args("input") editRestaurantInput : EditRestaurantInput
    ) : Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput)
    }

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(["Owner"])
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput:DeleteRestaurantInput,
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner,deleteRestaurantInput)
    }

    @Query(returns => RestaurantsOutput)
    restaurants(@Args('input') restaurantsInput : RestaurantsInput) : Promise<RestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantsInput)
    }

    @Query(returns => RestaurantOutput)
    restaurant(
      @Args('input') restaurantInput: RestaurantInput,
    ): Promise<RestaurantOutput> {
      return this.restaurantService.findRestaurantById(restaurantInput);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(
        @Args('input') searchRestaurantInput: SearchRestaurantInput
    ): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurantByName(searchRestaurantInput)
    }
}

@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService : RestaurantService) {}

        // computer field
        // dynamic field... DB에 실제로 저장되지 않는 field ... req가 있을 때마다 계산해서 보여주는 field
        // computer field,dynamic field는 로그인된 사용자의 상태에 따라 계산되는 field
        // ex) 인스타그램의 좋아요 기능

        @ResolveField(type => Int) // 매 req마다 계산된 field를 생성해줌.. resolver에서 계산되는 field
        restaurantCount(@Parent() category : Category): Promise<number> { // field 이름
            return this.restaurantService.countRestaurants(category)
        } 
        // restaurantCount(field)의 부모는 Category에게 정보를 요청하여 원하는 결과 값을 반환할 수 있다.

        @Query(type => AllCategoriesOutput)
        allCategories(): Promise<AllCategoriesOutput> {
            return this.restaurantService.allCategories()
        }
        
        @Query(type => CategoryOutput)
        category(@Args('input') categoryInput: CategoryInput) : Promise<CategoryOutput> {
            return this.restaurantService.findCategoryBySlug(categoryInput)
        }
}

@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService : RestaurantService) {} // restaurant가 없이는 dish를 만들 수 없기에
    // provider 추가 잊지 말 것!

    @Mutation(type => CreateDishOutput)
    @Role(['Owner']) // Owner만 resolver 접근 가능
    createDish(@AuthUser() owner:User,  // 유저 입장
    @Args('input') createDishInput: CreateDishInput):Promise<CreateDishOutput> {
        return this.restaurantService.createDish(owner, createDishInput)
    }

    @Mutation(type => EditDishOutput)
    @Role(['Owner'])
    editDish(@AuthUser() owner:User,
    @Args('input') editDishInput: EditDishInput):Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput)
    }
           
    @Mutation(type => DeleteDishOutput)
    @Role(['Owner'])
    deleteDish(@AuthUser() owner:User,
    @Args('input') deleteDishInput: DeleteDishInput):Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput )
    }
}
