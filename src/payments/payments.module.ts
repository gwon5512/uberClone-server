import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entites/restaurant.entity';
import { Paymnet } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
    imports:[TypeOrmModule.forFeature([Paymnet, Restaurant])],
    providers:[PaymentService, PaymentResolver]
})
export class PaymentsModule {} // nest g mo payments
