import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Restaurant } from "../entites/restaurant.entity";


@InputType()
// @ArgsType() 분리된 값을 전달해줌
export class createRestaurantDto extends OmitType(
    Restaurant,
    ['id'],
    //InputType 을 사용한다면 엔티티에 @InputType({isAbstract : true})는 빼야 한다
    ) {} //id 제외하고 다 가지고 오는 경우


    //Mapped Types
    //base type을 바탕으로 다른 버전들을 만들 수 있게 해준다
    //1.PartialType - base 타입 / 클래스를 export 하고 모든 필드가 required가 아닌 클래스를 만들어 준다 - 기본방식
    //2.PickType - input type에서 몇 가지 프로퍼티를 선택해 새로운 클래스를 만들어준다
    //3.OmitType - base 클래스에서 클래스를 만드는데 몇몇 필드를 제외하고 만드는 것이다
    //4.IntersectionType - 두 input을 합쳐준다