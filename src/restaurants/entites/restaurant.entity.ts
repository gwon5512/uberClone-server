import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { type } from "node:os";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Category } from "./cetegory.entity";
import { Dish } from "./dish.entity";

@InputType("RestaurantInputType",{isAbstract : true}) // inputType이 스키마에 포함되지 않길 원한다는 의미 -> 어떤 것으로 확장시킨다는 의미 
@ObjectType() // 자동으로 스키마를 빌드하기 위해 사용하는 graphql 데코레이터
@Entity() // TypeORM이 DB에 해당 엔티티를 저장하게 하는 역할

// ↑해준다면 DB에 model을 생성하고 자동으로 graphQL 에 스키마 작성을 할 수 있다.

export class Restaurant extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(type => String) // graphql
    @Column() // typeorm
    @IsString() // validation
    coverImg: string;

    // defaultValue 와 nullable의 차이
    // defaultValue 는 정의해주지 않는 이상 따로 입력하지 않아도 defaultValue : true 시에 true 가 출력된다.  defaultValue는 true / false 뿐만 아니라 string 등 어떤 것이든 될 수 있다.
    // nullable : true 시에 nullable 인지 아닌지만 나타낸다 <없어진다?>

    @Field(type => String) // => 필드 내용추가!
    @Column()
    @IsString()
    address: string

    @Field(type => Category,{nullable: true}) // graphql  ... category를 지울 때 restaurant을 지우면 안됨 그렇기에 category가 없는 경우도 가능
    @ManyToOne(type => Category, category => category.restaurants, {nullable: true, onDelete:"SET NULL"}) // ... category를 지울 때 restaurant을 지우면 안됨
    category: Category; // typeORM
    // restaurant category가 있고, 그 안에 field type으로 category가 있다. => app.module에서 entity 추가

    @Field(type => User) // 모든 restaurant에는 owner 존재... nullable 사용X , owner을 지우면 restaurant도 같이 지워져야함
    @ManyToOne(type => User, user => user.restaurants, {onDelete:'CASCADE'}) // user가 지워지면 restaurant도 같이 지워져야함
    owner: User;

    // relationid decorator relation의 id를 load
    @RelationId((restaurant : Restaurant) => restaurant.owner) // 어떤 relationId(restaurant.owner)를 로드하고 싶은지
    ownerId: number;

    @Field(type => [Order])
    @OneToMany(type => Order, order => order.restaurant) // 한 개의 restaurant은 많은 order를 가진다.
    orders: Order[]

    // restaurant은 menu를 가지고 menu는 Dish의 배열이다.
    @Field(type => [Dish])
    @OneToMany(type => Dish, dish => dish.restaurant)  // relationship
    menu: Dish[]

    // restaurants가 이미 존재하지만 해당 column이 없기에
    @Field(type => Boolean)
    @Column({default: false})
    isPromoted: boolean;

    // restaurants가 이미 존재하지만 해당 column이 없기에
    @Field(type => Date,{nullable:true})
    @Column({nullable:true})
    promotedUntil: Date

    // promotedUntil 에 있는 date가 현재 날짜보다 작으면 promote 종료

}


// graphQL database validation 3번 테스트 하는 것 익숙해져야 한다