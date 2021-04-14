import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entites/dish.entity';
import { Restaurant } from 'src/restaurants/entites/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
    imports:[TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])], // 배열
    providers: [OrderService, OrderResolver]
})
export class OrdersModule {}


// nest g mo orders -> app module 자동추가됨