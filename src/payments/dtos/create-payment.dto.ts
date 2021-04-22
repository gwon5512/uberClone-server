import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Paymnet } from "../entities/payment.entity";



@InputType()
export class CreatePaymentInput extends PickType(Paymnet,['transactionId','restaurantId']) {}


@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}