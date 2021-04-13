import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
    imports:[TypeOrmModule.forFeature([Order])], // 배열
    providers: [OrderService, OrderResolver]
})
export class OrdersModule {}


// nest g mo orders -> app module 자동추가됨