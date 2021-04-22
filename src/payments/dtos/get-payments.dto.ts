import { Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Paymnet } from "../entities/payment.entity";


@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
    @Field(type => [Paymnet],{nullable:true}) // 만약의 상태 대비 nullable
    payments?: Paymnet[]
}