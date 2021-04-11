import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Raw, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurants.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
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
    
    countRestaurants(category:Category) {
        return this.restaurants.count({category}) // countRestaurants으로 보낸 category에 해당하는 restaurant 숫자세기
    }

    async findCategoryBySlug( {slug, page}: CategoryInput) : Promise <CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                {slug},
                // {relations:['restaurants']} DB 과부하때문에
                // pagination을 사용해 restaurants을 부분적으로 load
                ) // DB에서 어떤 것을 load할 땐 같이 load하고 싶은 relation도 명시해주어야한다.
            if(!category) {
                return {
                    ok:false,
                    error:"Category not found"
                }
            }
            // category에 해당하는 restaurants 찾기
            // pagination 적용
            const restaurants = await this.restaurants.find({
                where:{
                    category // 위에서 선언한 category
                },
                take:25, // 해당 갯수만 받고 싶을 때
                skip: (page -1) * 25 // page 1일시 25개 take 0개 skip... page 2일시 25 take 하는데 25 skip
            })
            category.restaurants = restaurants
            const totalResults = await this.countRestaurants(category)
            return {
                ok:true,
                category,
                totalPages : Math.ceil(totalResults/25) // 정수로 만들기
            }
        } catch {
            return {
                ok:false,
                error:"Could not load category"
            }
        }
    }

    async allRestaurants({page} : RestaurantsInput): Promise<RestaurantsOutput>{
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({ // Restaurant의 array와 number를 return
                skip:(page-1)*25,
                take:25
            }) // 한 페이지의 크기 25
            return {
                ok:true,
                results: restaurants,
                totalPages:Math.ceil(totalResults/25),
                totalResults

            }
        } catch {
            return {
                ok:false,
                error:"Could not load restaurants"
            }
        }
    }

    // async findRestaurantById({
    //     restaurantId,
    //   }: RestaurantInput): Promise<RestaurantOutput> {
    //     try {
    //       const restaurant = await this.restaurants.findOne(restaurantId, {
    //         relations: ['menu'],
    //       });
    //       if (!restaurant) {
    //         return {
    //           ok: false,
    //           error: 'Restaurant not found',
    //         };
    //       }
    //       return {
    //         ok: true,
    //         restaurant,
    //       };
    //     } catch {
    //       return {
    //         ok: false,
    //         error: 'Could not find restaurant',
    //       };
    //     }
    //   }

   async findRestaurantById({
        restaurantId,
      }: RestaurantInput): Promise<RestaurantOutput> {
        try {
          const restaurant = await this.restaurants.findOne(restaurantId);
          if (!restaurant) {
            return {
              ok: false,
              error: 'Restaurant not found',
            };
          }
          return {
            ok: true,
            restaurant,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not find restaurant',
          };
        }
      }

      async searchRestaurantByName({
        query,
        page,
      }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
          const [restaurants, totalResults] = await this.restaurants.findAndCount({
            where: { // 대소문자 검색을 해결하기 위해 I(insensitive)LIKE 활용
              name: Raw(name => `${name} ILIKE '%${query}%'`), // 어디든지 query가 들어간 것 검색
            },                          // ↑ sql로 DB 접근
            skip: (page - 1) * 25,
            take: 25,
          });
          return {
            ok: true,
            restaurants,
            totalResults,
            totalPages: Math.ceil(totalResults / 25),
          };
        } catch {
          return { ok: false, error: 'Could not search for restaurants' };
        }
      }
}
// repository를 inject하고 나면 restaurants.module에서 모든 것이 돌아간다.
