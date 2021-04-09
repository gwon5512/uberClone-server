import { ArgsType, Field, InputType, ObjectType, OmitType, PickType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entites/restaurant.entity";


@InputType()
// @ArgsType() 분리된 값을 전달해줌
export class CreateRestaurantInput extends PickType(Restaurant,['name','coverImg','address']) 
{

    @Field(type => String)
    categoryName: string

} 
    

    // id 제외하고 다 가지고 오는 경우
    // restaurant에서 사람들이 category가 있는 restaurant를 못 만들게 하기위해 category 제거
    // restaurant의 owner를 설정할 수 없게 -> 로그인한 유저에게서만

    @ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
    //Mapped Types
    //base type을 바탕으로 다른 버전들을 만들 수 있게 해준다
    //1.PartialType - base 타입 / 클래스를 export 하고 모든 필드가 required가 아닌 클래스를 만들어 준다 - 기본방식
    //2.PickType - input type에서 몇 가지 프로퍼티를 선택해 새로운 클래스를 만들어준다
    //3.OmitType - base 클래스에서 클래스를 만드는데 몇몇 필드를 제외하고 만드는 것이다
    //4.IntersectionType - 두 input을 합쳐준다