import { JwtService } from "./jwt.service"
import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import * as jwt from 'jsonwebtoken'; // 디펜던시를 import 했지만 디펜던시를 mock 하고 있기에 mock으로 결과가 대체 가능하다.



const TEST_KEY = 'testKey' // testKey를 상수로 바깥에 생성
const USER_ID = 1

// json web token을 mock
jest.mock('jsonwebtoken',() => { // 인자에 npm module의 이름... 구현하는 부분에 해당하는 factory 추가 가능
    return {
        sign: jest.fn(() => "TOKEN"), // jest함수 생성 및 sign 항상 token을 반환
        verify: jest.fn(() => ({id:USER_ID})) // payload return ... decoded 된 token을 return
    }
})

describe('JwtService',() => {
    let service : JwtService // 타입
    beforeEach(async () => {
        const module = await Test.createTestingModule({ // testing 모듈... Test import 하기
            providers : [JwtService,{
                provide:CONFIG_OPTIONS, // inject 된 파일을 provide 해줌
                useValue:{privateKey:TEST_KEY}  // JwtModuleOptions 참조 
            }]
        }).compile()
        service = module.get<JwtService>(JwtService) // service 가져오기 
    })                      // ↑ 가지고 오려는 타입
    it('should be defined', () => { // test 생성
        expect(service).toBeDefined();
      }); // service 파일에 console을 해봄으로 테스트가 제대로 되는지 확인가능

      // sign과 userId 필요... sign이 호출 된 횟수 체크 및 반환값 mock... sign이 어떻게 호출되는지
      describe('sign',() => { // describe 안에 여러 개의 test를 넣어야 한다면 nested(중첩) describes 사용
          it('should return a signed token', () => {
                
                const token = service.sign(USER_ID) // userId 필요
                expect(typeof token).toBe('string') // token의 타입을 string으로 expect -> 반환값 체크
                expect(jwt.sign).toHaveBeenCalledTimes(1)
                expect(jwt.sign).toHaveBeenCalledWith({id:USER_ID}, TEST_KEY) // userId를 가진 obj, privateKey 불러와야함
          }) // sign token 반환
         
      })
      // verify 호출 된 횟수 체크 및 어떤 값을 가지고 어떻게 호출되는지
      describe('verify', () => {
          it('should return the decoded token',() => {
              const TOKEN = "TOKEN"
              const decodedToken = service.verify(TOKEN) 
              expect(decodedToken).toEqual({id:USER_ID}) // decodedToken은 payload ...verify: jest.fn(() => ({id:USER_ID}))
              expect(jwt.verify).toHaveBeenCalledTimes(1)
              expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY)

          })
      })
})


// 외부 라이브러리(ex)jwt.sign)를 Mocking 하는 방법