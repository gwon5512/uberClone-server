import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { RestaurantsResolver } from './restaurants.resolver';
import { fromEventPattern } from 'rxjs';
import { RestaurantService } from './restaurants.service';

@Module({
    imports:[TypeOrmModule.forFeature([Restaurant])], // entity // Typeorm repository를 inject 하려고 import 작성
    providers:[RestaurantsResolver, RestaurantService ] // RestaurantService추가
})
export class RestaurantsModule {}
