import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createRestaurantDto } from "./dtos/create-restaurants.dto";
import { Restaurant } from "./entites/restaurant.entity";
import { UpdateRestaurantDto } from "./dtos/update-restaurants.dto"

@Injectable()
export class RestaurantService { // repository를 사용하기 위해 service를 resolver에 import
    constructor(
        @InjectRepository(Restaurant) // === const ~~Repository = connection getRepository(~~) // restaurant entity의 repository inject
                         // ↑엔티티이름
        private readonly restaurants:Repository<Restaurant>
        ) {} // repository의 이름은 restaurants class는 Restaurant entity 가짐
      
    // repository inject
    getAll():Promise<Restaurant[]>{
        return this.restaurants.find(); // DB 접근 방식 로직작성 -> repository에 접근해 모든 것을 할 수 있다.
    } // find는 async 메소드이기에 Promise 사용 // restaurants는 restaurant entity 의 repository 이다.

    createRestaurant(createRestaurantDto: createRestaurantDto) :Promise <Restaurant> { // save는 Promise 리턴... type은 Restaurant

        const newRestaurant = this.restaurants.create(createRestaurantDto) // DB는 건드리지 않고 create를 통해 새로운 instance 생성
                                 // ↑ js만 존재하고 DB에 실제로 있지는 않다 그렇기에 밑에 .save를 이용한다
        return this.restaurants.save(newRestaurant)
        // create는 Restaurant를 리턴하고 save는 Promise 를 리턴한다
    }
    
    updateRestaurant({id, data}:UpdateRestaurantDto) {
        return this.restaurants.update(id,{...data}) // update 하고 싶은 entity의 필드를 보내야한다 -> update 하고 싶은 object id
        // update는 Promise를 리턴 // 첫 번째 인자는 search의 criteria의 것을 두 번째 인자로 업데이트 하는 것
    }   // 해당 엔티티가 존재하는지 확인하지 않으니 주의!!


}

// repository를 inject하고 나면 restaurants.module에서 모든 것이 돌아간다.
