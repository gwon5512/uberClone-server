import { Injectable,Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options : MailModuleOptions,
      
    ) {
    
    }
      // api로 post request보내기
    private async sendEmail(subject:string, template:string, emailVars:EmailVar[]) { // 프론트에서 fetch 같이 api를 이용하기 위해 got설치
      // Form data는 node 에서 스트림을 만드는 라이브러리                     // ↑이메일변수의 배열
        const form = new FormData();
        form.append("from", `Ikseong from Nuber Eats <mailgun@${this.options.domain}>`)
        form.append("to", `gwon5512@naver.com`) // 받는사람
        form.append("subject", subject)
        // form.append("text", content)
        form.append("template",template) // "템플릿","템플릿명"
        // form.append("v:code","showmethemoney") // "v:변수명","입력할 내용" -> interface에 emailVar 작성
        emailVars.forEach(eVar => form.append(`v:${eVar.key}`,eVar.value)) // 변수부분에 ${ } 주의!!

        // quietly fail(함수를 실행함에 있어서 에러가 있어도 알리지 않음) - ex) 이메일을 보내지 못했다는 알림을 보이지 않아도 됨
        try{
            await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`,{ // URL + domain + messages
            method:"POST",
            headers:{ // basic authorization (유저명와 패스워드 필요)  string 값 포맷을 인코딩 => base64형식으로 Buffer.from('api:YOUR_API_KEY').toString('base64')
                "Authorization" :`Basic ${Buffer.from(
                    `api:${this.options.apiKey}`
                    ).toString("base64")}` 
            },
            body: form
          })
        } catch(error) {
            console.log(error)
        } 
    }

    sendVerificationEmail(email:string, code:string) {
        this.sendEmail("Verify Your Email","initial",[ // subject, template, emailVar
            {key:"code",value:code},
            {key:"username",value:email}
        ])
    }
} 

// mailgun -> 변수 설정시 {{변수명}}