import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entites/restaurant.entity";

@Injectable()
export class RestaurantService { // repository를 사용하기 위해 service를 resolver에 import
    constructor(
        @InjectRepository(Restaurant) // restaurant entity의 repository inject
        private readonly restaurants:Repository<Restaurant>
        ) {} // repository의 이름은 restaurants class는 Restaurant entity 가짐
      
    // repository inject
    getAll():Promise<Restaurant[]>{
        return this.restaurants.find(); // DB 접근 방식 로직작성 -> repository에 접근해 모든 것을 할 수 있다.
    } // find는 async 메소드이기에 Promise 사용
}

// repository를 inject하고 나면 restaurants.module에서 모든 것이 돌아간다.
