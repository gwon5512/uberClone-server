import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import * as request from 'supertest';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';


// account 를 생성할 때마다 email을 전송하게 되는데 resolver 테스트 시에는 굳이 이렇게 까지는 할 필요없다. => mock
jest.mock('got', () => {
  return {
    post: jest.fn()
  }
})

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email:"nico@las.com",
  password:"12345"
}

// end-to-end testing file
describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>
  let verificationRepository : Repository<Verification>
  let jwtToken: string; // token을 공유할 수 있다.(const로는 생성하면 안됨) token을 바깥에 놓고 바깥 변수를 업데이트 하는 식으로 사용
                                          // server / GRAPHQL_ENDPOINT
  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT); // 기본적으로 모든 test의 기본이 되는 것들을 반환 (해당 url로 posting... post request, data 보내기)
  const publicTest = (query: string) => baseTest().send({ query }); // query를 string으로 받고 data를 query 형태로 내보냄
  const privateTest = (query: string) => // 
    baseTest()
      .set('X-JWT', jwtToken) // token ... post 뒤에 set 해야함!! .set(헤더, value) => superTest를 사용해 header를 set하는 방법
      .send({ query });

  beforeAll(async () => { // 각각의 test 전에 module을 load하지 않고 모든 test 전에 module load하기 위해 (beforeEach -> beforeAll변경)
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // UserModule 만을 import 하는 것이 아니라 전체 AppModule(모든 모듈이 포함되있음) import... 
    }).compile();           // 전체 application 을 불러낸 후 resolver를 테스트

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User)) // User로부터 getRepositoryToken 받아오기... get에서 type 명시도 가능
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification))
    await app.init();
  });

  afterAll(async() => {
    await getConnection().dropDatabase() // test 완료 후 DB drop
    app.close() // test 후 application 종료
  }) // aplication 종료 로직 작성

  describe('createAccount', () => {
    
    it('should create account', () => { // 먼저 account를 만들고, 그 다음에 다시 생성 시도를 하는 로직...
      // GraphQL Resolver를 test하는 방법 - mutation 보내기(Resolver를 테스트 함으로써 자동적으로 service와 typeorm도 잘 작동하는지 확인가능)
      return publicTest( // 해당 url로 posting... post request, data 보내기
        `mutation {
          createAccount(input : {
            email:"${testUser.email}",
            password:"${testUser.password}",
            role:Owner
          }) {
            ok
            error
          }
        }` // graphql 방식 === "{me{id}}와 동일" (``포맷사용)
       )
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true) // true 시
        expect(res.body.data.createAccount.error).toBe(null) // error 시
      })
    })

    it('should fail if account already exists', () => {
      return publicTest (
        `mutation {
          createAccount(input : {
            email:"${testUser.email}",
            password:"${testUser.password}",
            role:Owner
          }) {
            ok
            error
          }
        }`
      )
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false)
        expect(res.body.data.createAccount.error).toBe("There is a user with that email already")
      }) // toEqual은 어떤 string이든 expect 하게 해줌.. toBe 사용시 반환할 문자열을 확인하여 정확히 넣어주어야한다.
    })
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest (
        `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"${testUser.password}",
            }) {
              ok
              error
              token
            }
          }
        `
      )
      .expect(200)
      .expect(res => {
        const {body : {data : {login}}} = res // body 내의 data 내에서 login 가져오기(res 안에서)
        expect(login.ok).toBe(true)
        expect(login.error).toBe(null)
        expect(login.token).toEqual(expect.any(String)) // 로그인 성공시 token을 받음 ... authenticate(인증) 작업 필요 그렇기에 이 test에서 가지고 나간다.
        jwtToken = login.token // 나중에 token을 다시 사용하기 위해(공유하기 위해 바깥에 두도록한다) -- token 업데이트
      })
    })
    it('should not be able to login with wrong credentials', () => {
      return publicTest(
         `
          mutation {
            login(input:{
              email:"${testUser.email}",
              password:"xxx",
            }) {
              ok
              error
              token
            }
          }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {data : {login}}} = res
        expect(login.ok).toBe(false)
        expect(login.error).toBe("Wrong password")
        expect(login.token).toBe(null)
      })
    })
  });

  // 앞서 로직을 구성하여 usersRepository를 가져 올 수 있으니 userProfile을 하기 전에 DB에 접근이 가능하다는 뜻
  describe('userProfile' ,() => {
    let userId : number; // it과 beforeAll의 바깥에 있어야 한다.
    //userProfile의 모든 test 이전에 DB 들여다보기
    beforeAll(async () => {
        const [user] = await usersRepository.find(); // user라는 배열에서 첫번째 인자를 뽑아낸 것
        userId = user.id // const로 작성하면 안됨
      })

      // test1
      it("should see a user's profile", () => { // post 뒤에 set 해야함!! // 헤더, value... => superTest를 사용해 header를 set하는 방법
        return privateTest(
          `
          {
            userProfile(userId:${userId}) {
              ok
              error
              user {
                id
              }
            }
          }
          `
         ) // graphql
        .expect(200)
        .expect(res => {
          const {body : {data: { userProfile : {ok,error,user :{id}}}}} = res
          // body 안에 data 안에 userProfile 안에 ok,error,user.. user 안에 id
          
          expect(ok).toBe(true)
          expect(error).toBe(null)
          expect(id).toBe(userId) // graphql로 부터 받은 id가 query를 부르는 데 사용한 것과 동일해야함
          
        })
      })
      // test2
      it("should not find a profile", () => {
        return privateTest ( // 존재하지 않는 userId
          `
          {
            userProfile(userId:666) {
              ok
              error
              user {
                id
              }
            }
          }
          `
         ) // graphql
        .expect(200)
        .expect(res => {
          const {body : {data: { userProfile : {ok,error,user}}}} = res // userid 필요 없음
          expect(ok).toBe(false)
          expect(error).toBe("User Not Found")
          expect(user).toBe(null) // user만 남겨둠
        })
      })
    
  });

  describe('me', () => { // 로그인 됬을 때 안 됬을 때 2가지 경우
    it('should find my profile' , () => {
      return privateTest(
        `
          {
            me {
              email
            }
          }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {data : {me : {email}}}} = res 
        expect(email).toBe(testUser.email) // email은 생성한 email과 동일해야 함
      })
    })
    it('should not allow logged out user' ,() => {
      return publicTest( // server
                         // GRAPHQL_ENDPOINT ... token을 set 하지 않기에 빼줌(로그아웃 된 user들을 허용하지 않기위해)
          `
          {
            me {
              email
            }
          }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {errors}} = res;
        const [error] = errors;
        expect(error.message).toBe("Forbidden resource");
      })
    })
  });

  describe('editProfile', () => { // email, password 변경
    const NEW_EMAIL = "nico@new.com" // 새 메일이 DB에 있는지 test
    it('should change email' , () => {
   
      return privateTest(
        `
        mutation {
          editProfile(input:{
            email:"${NEW_EMAIL}"
          }) {
            ok
            error
          }
        }
        `
       )
      .expect(200)
      .expect(res => {
        const {body :{data :{ editProfile : {ok,error}}}} = res;
        expect(ok).toBe(true)
        expect(error).toBe(null)
      })
      
    }) // email을 수정하고 난 후 req를 보냄 => me로(새 email을 받을 수 있게)
    it('should have new email' , () => { // then() 을 사용해서도 다음 test를 넣을 수 있다. 하지만 가독성 떨어짐 
      return privateTest(
        `
            {
              me {
                email
              }
            }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {data :{me :{email}}}} = res;
        expect(email).toBe(NEW_EMAIL) // email이 NEW_EMAIL과 동일 한 것으로 expect
      })
    })
  });

  describe('verifyEmail', () => { 
    let verificationCode : string; // verify
    beforeAll(async () => {
      const [verification] = await verificationRepository.find(); // verification을 하나 만들고 email을 변경할 시 삭제 한 다음 새로 하나를 만들기에 id는 2
      verificationCode = verification.code
     
    })
    it('should verify email', () => { // email verify... verify 하기 위해 로그인 필요 X(set X)
      return publicTest(
        `
        mutation {
          verifyEmail(input:{
            code:"${verificationCode}"
          }) {
            ok
            error
          }
        }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {data :{verifyEmail :{ok,error}}}} = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
      })
    })
    it('should fail on wrong verification code not found' , () => {
      return publicTest(
        `
        mutation {
          verifyEmail(input:{
            code:"xxxxx"
          }) {
            ok
            error
          }
        }
        `
       )
      .expect(200)
      .expect(res => {
        const {body : {data :{verifyEmail :{ok,error}}}} = res
        expect(ok).toBe(false)
        expect(error).toBe("Verification not found.")
      })
    });
  });
 
});
// npm run test:e2e
// jest-e2e.json 파일에서 e2e test 설정... moduleNameMapper 부분을 복사해서 하단 부 추가 (처음 테스트 실행시 경로 문제시)
// moduleNameMapper 부분(src로 시작하는 모든 경로를 rootDir(src)로 시작하는 경로로 가는 것, src로 들어갈 상대 경로 추가 작성해주어야함)
//  => src 내부로 들어가서 우리가 원하는 것을 찾을 수 있다.

// 해당 NODE_ENV:Joi 설정과 test env 파일 생성및 데이터 입력 
// 적어도 하나의 테스트는 존재해야한다.
// 해당 테스트 DB 생성


// coverage 폴더를 보게되면 unit 테스트 시 coverage를 포함한 결과(인터페이스)를 보여주는 html 페이지가 있다.
// 정렬 및 어떤 부분이 테스트 되지 않았는지도 파악가능


// --detectOpenHandles를 npm run test:e2e 커맨드에 추가하면 코드의 어떤 부분이 open 상태였는지 알려준다.(중지되지 않은 상태)