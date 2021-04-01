import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service";



// 생성시 spec 필수!(jest에서 spec.ts를 찾기 때문에)
describe("UserService",() => {

  let service:UsersService 

    // 테스트 하기 이전에 테스트 모듈 만들기
  beforeAll(async () => {

    // 모듈 생성
    const module = await Test.createTestingModule({ 
    // import 할 모듈(서비스를 모듈 밖으로 불러내기)
        providers:[UsersService] // 유저서비스만 테스트(graphql, resolver제외하고) => 모든 테스트들은 독립적으로 시행
    }).compile()
    service = module.get<UsersService>(UsersService);

  })


  it('should be defined',() => {
      expect(service).toBeDefined();
  })


  // 유저 서비스에서 어떤 것을 테스트할지?
  it.todo('createAccount');
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');

})


// const mockRepository = {

// }



// describe("createAccount",()=>{
//     it('should fail if user exists',()=>)
// })

