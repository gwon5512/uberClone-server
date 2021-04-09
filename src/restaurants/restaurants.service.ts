import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurants.dto";
import { Category } from "./entites/cetegory.entity";
import { Restaurant } from "./entites/restaurant.entity";

@Injectable() 
export class RestaurantService { // repository를 사용하기 위해 service를 resolver에 import
    constructor(
        @InjectRepository(Restaurant) // === const ~~Repository = connection getRepository(~~) // restaurant entity의 repository inject
                         // ↑엔티티이름
        private readonly restaurants:Repository<Restaurant>, // repository inject
        @InjectRepository(Category)
        private readonly categories:Repository<Category> // category repository 생성
        ) {} // repository의 이름은 restaurants class는 Restaurant entity 가짐
    async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput) :Promise <CreateRestaurantOutput> { // save는 Promise 리턴... type은 Restaurant
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput)
            newRestaurant.owner = owner
            //slug ... trim은 앞뒤 빈칸을 지워줌
            const categoryName = createRestaurantInput.categoryName.trim().toLowerCase()
            const categorySlug = categoryName.replace(/ /g, "-") // 레귤러 익스프레션을 사용하여 빈칸을 -로 바꿈
            //category 찾거나 생성... 변할 것이기에 let 선언
            let category = await this.categories.findOne({slug:categorySlug})
            if(!category) {
              category = await this.categories.save(
                  this.categories.create({ slug: categorySlug, name: categoryName })
              )
            } 
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
}

// repository를 inject하고 나면 restaurants.module에서 모든 것이 돌아간다.
