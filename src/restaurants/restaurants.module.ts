import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entites/restaurant.entity';
import { RestaurantsResolver } from './restaurants.resolver';
import { fromEventPattern } from 'rxjs';
import { RestaurantService } from './restaurants.service';
import { Category } from './entites/cetegory.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Restaurant,Category])], // entity // Typeorm repository를 inject 하려고 import 작성 2 // forFeature은 특정 feature을 import 할 수 있게 해준다
    providers:[RestaurantsResolver, RestaurantService ] // RestaurantService추가
})
export class RestaurantsModule {}
