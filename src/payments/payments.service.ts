import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entites/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";
import { Paymnet } from "./entities/payment.entity";
import { Cron, Interval, Timeout, SchedulerRegistry } from '@nestjs/schedule';



@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Paymnet)
        private readonly payments: Repository<Paymnet>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>, // module에 추가
        private schedulerRegistry: SchedulerRegistry 
    ) {}

    async createPayment(owner: User, {transactionId, restaurantId}: CreatePaymentInput) : Promise<CreatePaymentOutput> {
       try {
            // restaurant find
        const restaurant = await this.restaurants.findOne(restaurantId)
        if(!restaurant) {
            return {
                ok:false,
                error:"Restaurant not found."
            }
        } // 해당 restaurant 주인이 아닌 경우
        if(restaurant.ownerId !== owner.id) {
            return {
                ok:false,
                error:"You are not allowed to do this."
            }
        }
        await this.payments.save(this.payments.create({
            transactionId,
            user: owner,
            restaurant
        }))
        return {
            ok:true
        }
       } catch {
           return {
               ok:false,
               error:"Could not create payment."
           }
       }

    }

    async getPayments(user:User) : Promise<GetPaymentsOutput> {
     try {
        const payments = await this.payments.find({user:user})
        return {
            ok:true,
            payments
        }
     } catch {
        return {
            ok:false,
            error:"Could not load payments."
        }
     }
    }

// task scheduling은 원하는 time interval 또는 정해진 시간과 날짜에 function을 실행할 수 있게 해준다.
// npm install --save @nestjs/schedule

// 사용법 -> service 안에 cron decorator 사용
// cron pattern
// https://docs.nestjs.com/techniques/task-scheduling

// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | month
// | | | day of month
// | | hour
// | minute
// second (optional)


    // Declarativet 식
    // 해당 작업의 이름을 부여하여 stop 지시 등 명령을 내릴 수도 있다. (SchedulerRegistry 부터 import! constructor에)
    // @Cron('30 * * * * *',{
    //     name:"myJob"
    // }) // 매분 30초마다!
    // async checkForPayments() {
    //     console.log("Checking for payments....(cron)")
    //     const job = this.schedulerRegistry.getCronJob("myJob")
    //     job.stop();
    // }

    // @Interval(5000) // 실행 후 5초마다
    // async checkForPaymentsI() {
    //     console.log("Checking for payments....(interval)")
    // }

    // @Timeout(20000) // ?후에 발생 (1번만 실행)
    // afterStarts() {
    //     console.log('Congrats!')
    // }

    

}