import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurants.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entites/cetegory.entity";
import { Restaurant } from "./entites/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable() 
export class RestaurantService { // repository를 사용하기 위해 service를 resolver에 import
    constructor(
        @InjectRepository(Restaurant) // === const ~~Repository = connection getRepository(~~) // restaurant entity의 repository inject
                         // ↑엔티티이름
        private readonly restaurants:Repository<Restaurant>, // repository inject
        private readonly categories:CategoryRepository // category repository 생성
        ) {} // repository의 이름은 restaurants class는 Restaurant entity 가짐

// repository를 생성할 때마다 service의 type을 바꿔야함 그리고 그 repository를 (~.module파일에서) load 해줘야한다. inject 될 수 있게

    async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput) :Promise <CreateRestaurantOutput> { // save는 Promise 리턴... type은 Restaurant
        try {
            
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            // category를 name을 이용해서 get하거나 create 한다.
            const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);
            return {
                ok: true
            }
        } catch {
            return {
                ok:false,
                error:"Could not create restaurant"
            }
        }
    }

    async editRestaurant(owner:User, editRestaurantInput:EditRestaurantInput) : Promise<EditRestaurantOutput> {
        // 레스토랑을 찾고 수정
       try {
        const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId, // id로 찾기
            // {loadRelationIds : true}) id 만 가져오고 obj를 가져오지 않음
        )
        if(!restaurant) {
            return {
                ok:false,
                error:"Restaurant not found"
            }
        }
        if(owner.id !== restaurant.ownerId) {
            return {
                ok:false,
                error:"You can't edit a restaurant that you don't own."
            }
        } // 처음에 에러를 핸들링(defensive programming)
        let category : Category = null; // default 값 null
        if(editRestaurantInput.categoryName) {
            category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
        }
        // obj(entity) 생성
        await this.restaurants.save([{ // 업데이트를 하고 싶을 땐 배열 그리고 업데이트 하고 싶은 entity
            id:editRestaurantInput.restaurantId, // id를 보내지 않은 경우 새로운 entity를 생성하는 작업진행... 그렇기에 꼭 id를 보내주어야함 update해주기위해
            ...editRestaurantInput, // editRestaurantInput 안에 있는 것을 여기에 넣어 달라는 의미
            ...(category && {category}) // category가 존재하면 category가 category인 obj return 그리고 null 인 경우도 존재(null 포함X)
        }])
        return {
            ok:true
        }
       } catch {
           return {
               ok:false,
               error:"Could not edit Restaurant"
           }
       }
    }
    
    async deleteRestaurant(
        owner: User,
        {restaurantId} : DeleteRestaurantInput
    ) : Promise <DeleteRestaurantOutput> {
        // Restaurant 찾기
       try {
        const restaurant = await this.restaurants.findOne(restaurantId,    
            )
            if(!restaurant) { // 존재하지 않는 경우
                return {
                    ok:false,
                    error:"Restaurant not found"
                }
            }
            if(owner.id !== restaurant.ownerId) { // owner의 id와 restaurant의 ownerId와 같지 않다면
                return {
                    ok:false,
                    error:"You can't delete a restaurant that you don't own."
                }
            } // 위 조건에 해당하지 않는다면 delete
            // console.log("will delete", restaurant)
            await this.restaurants.delete(restaurantId)
            return {
                ok:true
            }
           
       } catch { 
        return {
            ok:false,
            error:"Could not delete restaurant."
        }
       }
    }

    async allCategories() : Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find()
            return {
                ok: true,
                categories // AllCategoriesOutput에 categories가 없어서 추가해주어야함
            }
        } catch {
            return {
                ok:false,
                error:"Could not load categories"
            }
        }
    }

}
// repository를 inject하고 나면 restaurants.module에서 모든 것이 돌아간다.
