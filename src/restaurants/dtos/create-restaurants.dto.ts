import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";


@ArgsType() //분리된 값을 전달해줌
export class createRestaurantDto {
    @Field(()=> String)
    @IsString()
    name : string

    @Field(()=>Boolean)
    @IsBoolean()
    isVegan: boolean

    @Field(()=>String)
    @IsString()
    address: string
    
    @Field(()=>String)
    @IsString()
    @Length(5,10)
    ownerName: string
}