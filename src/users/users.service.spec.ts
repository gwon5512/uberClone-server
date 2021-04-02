import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = {
  findOne:jest.fn(), // 가짜함수(사용되었지만?)
  save:jest.fn(),
  create:jest.fn(),
}

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn()
}

const mockMailService = {
  sendVerificationEmail:jest.fn()
}

type MockRepository<T = any> = Partial<Record<keyof Repository<User>, jest.Mock>>;
                                            //↑Repository의 모든 키 가져오기 ...Record의 프로퍼티는 findOne, save, create, update ...같은 것 그리고 타입은 mock
// 생성시 spec 필수!(jest에서 spec.ts를 찾기 때문에)
describe("UserService",() => {

  let service:UsersService;
  let usersRepository: MockRepository<User> // usersRepository 만들기! 그리고 UserRepository의 모든 함수 가져오기!
                      //↑Repository의 모든함수(ALL) 이 함수들의 타입이 jest.Mock 함수                               
  // 테스트 하기 이전에 테스트 모듈 만들기
  beforeAll(async () => {

    // 모듈 생성
    const module = await Test.createTestingModule({ 
    // import 할 모듈(서비스를 모듈 밖으로 불러내기)
        providers:[
          UsersService, // 진짜 UsersService를 불러서
          { // 가짜 repository(user,verification), jwtservice,mailservice 제공
          provide:getRepositoryToken(User), 
          useValue: mockRepository
        },
        {
          provide:getRepositoryToken(Verification), 
          useValue: mockRepository
        },
        {
          provide:JwtService, 
          useValue: mockJwtService
        },
        {
          provide:MailService, 
          useValue: mockMailService
        },
      ] // 유저서비스만 테스트(graphql, resolver제외하고) => 모든 테스트들은 독립적으로 시행
    }).compile()
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User))
  })
  
  it('should be defined',() => {
      expect(service).toBeDefined();
  })


  // 유저 서비스에서 어떤 것을 테스트할지?
  describe('createAccount',() => {

    it("should fail if user exists", async () => {
      // mock은 함수의 반환값을 속일 수 있다. => createAccount 의 의존관계의 반환값을 mock
      usersRepository.findOne.mockResolvedValue({ // userservice의 findone을 해결한다? 
        id:1,                 //↑Promise시 (다른종류도 많음)
        email:'' // findOne 값이 실제 값 대신에 이 값을 리턴
      }) // jest와 mock을 사용해서 디펜던시에 있는 함수의 반환값을 속일 수 있다. => DB에 유저가 있다고 속일 수도 있다(실제 DB접속이나 typeORM을 쓰지 않고도)
      const result = await service.createAccount({ // promise 반환
        email:"",
        password:"",
        role:0
      })
      expect(result).toMatchObject({
        ok:false, error:'There is a user with that email already'
      })
    })

  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');

})

// describe("createAccount",()=>{
//     it('should fail if user exists',()=>)
// })



// "moduleNameMapper":{
//   "^src/(.*)$":"<rootDir>$1"
// },

// 경로를 어떻게 해석할 지 (jest가 파일을 찾는 방식을 수정)
// src로 시작하는 것이 있으면 우리의 root디렉토리(src)에서 이 경로를 찾는다(정규표현식)

// 각 줄을 고립된 상태에서 테스트 