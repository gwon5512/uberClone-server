import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Order } from "../entities/order.entity";





// id를 가지고 order를 찾고, 업데이트 할 status 보내기
@InputType()
export class EditOrderInput extends PickType(Order, ['id','status']) {

}

@ObjectType()
export class EditOrderOutput extends CoreOutput {
    
}