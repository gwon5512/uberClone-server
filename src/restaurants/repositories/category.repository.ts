import { EntityRepository, Repository } from "typeorm";
import { Category } from "../entites/cetegory.entity";


@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {

    async getOrCreate(name:string) : Promise<Category> { // category name과 slug를 가져옴
        //slug ... trim은 앞뒤 빈칸을 지워줌
        const categoryName = name.trim().toLowerCase()
        const categorySlug = categoryName.replace(/ /g, "-") // 레귤러 익스프레션을 사용하여 빈칸을 -로 바꿈
        //category 찾거나 생성... 변할 것이기에 let 선언
        let category = await this.findOne({slug:categorySlug})
        if(!category) {
            category = await this.save(
                this.create({ slug: categorySlug, name: categoryName })
                )
            }
            return category 
        }
// this.categories는 repository이기에 categories는 빼야함(this만)
}


// custom repository 사용법
// 1. repository class를 extend -> repository는 모든 method를 접근가능하게 한다.
// 2. abstract repository calss를 extend -> public method를 원하는지 아닌지에 달림(1번 과의 차이점)
// 3. entity repository 를 만들고 constructor를 가지는 것