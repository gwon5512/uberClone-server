import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { CategoryResolver, DishResolver, RestaurantsResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { Dish } from './entites/dish.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])], // entity // Typeorm repository를 inject 하려고 import 작성 2 // forFeature은 특정 feature을 import 할 수 있게 해준다
    providers:[RestaurantsResolver, RestaurantService, DishResolver, CategoryResolver] // RestaurantService, AllCategoriesOutput추가
})
export class RestaurantsModule {}
