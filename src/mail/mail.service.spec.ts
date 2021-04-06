import { Test } from "@nestjs/testing"
import { CONFIG_OPTIONS } from "src/common/common.constants"
import { MailService } from "./mail.service"
import * as FormData from 'form-data';
import got from 'got';

// 라이브러리 mock
jest.mock('got') // got 자체를 mock(import 해서 바로 사용하기에) undefined return
jest.mock('form-data')
// 어느 특정 부분을 리턴하도록 정의 하는 것이 아니라 전체를 mock

const TEST_DOMAIN = "test-domain"

describe("MailService", () => {
    let service : MailService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers:[MailService,{
                provide:CONFIG_OPTIONS, // Inject(CONFIG_OPTIONS)
                useValue: {
                    apiKey:'test-apiKey',
                    domain: TEST_DOMAIN,
                    fromEmail:'test-fromEmail'
                }// MailModuleOptions 참고
            }]
        }).compile()
        service = module.get<MailService>(MailService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
    describe('sendVerificationEmail', () => {
        it('should call sendEmail', () => {
            const sendVerificationArgs = {
                email: 'email',
                code: 'code'
            }
            // sendEmail이 한번 호출 된 것을 테스트... sendVerificationEmail이 아무것도 반환하지 않았음을 테스트... 값이 올바른지 확인 ... 인자 값 체크
            // 함수를 mock 할 수 없을 시 spy 사용... sendEmail에 spying
            jest.spyOn(service,'sendEmail').mockImplementation(async() => true) // async 확인
            // mockImplementation 은 implementation들을 전부 mock 할 수 있게 해준다.
            // ex) sendEmail이 호출 되었을 시 그 콜을 가로채서 나만의 구현을 추가 할 수 있게 해주는 것
            service.sendVerificationEmail(sendVerificationArgs.email,sendVerificationArgs.code) 
            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith( // 인자 그대로 .. 정확히 값들을 불렀는지 확인
                "Verify Your Email",
                "initial",
                [
                    {key:"code",value:sendVerificationArgs.code},
                    {key:"username",value:sendVerificationArgs.email}
                ]
            )            
        })
    })
    describe('sendEmail', () => {
        it('sends email', async () => {
            const ok = await service.sendEmail("","",[])
            // 1. form.append가 호출 되고 있는지 확인
            // 2. got가 string과 obj를 가지고 실행되는지 확인
            const formSpy = jest.spyOn(FormData.prototype,"append") // form-data import ..
            // append는 new FormData() 실행해서 FormData를 만든 후 실행했기에 prototype
            expect(formSpy).toHaveBeenCalled() // 함수가 불리기만 함
            expect(got.post).toHaveBeenCalledTimes(1)
            expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object)) // got import ..
            expect(ok).toEqual(true)
        })
        it('fails on error', async() => {
            // sendEmail을 호출하고 sendEmail이 got.post를 호출 할때 Implementation을 mock하고 error를 throw
            // sendEail 함수를 호출하기 전에
            jest.spyOn(got,"post").mockImplementation(() => { // Implementation 을 mock
                throw new Error()
            }) // got.post가 호출 될 때 에러    
            const ok = await service.sendEmail("","",[])
            expect(ok).toEqual(false)
        })
    })
   
})