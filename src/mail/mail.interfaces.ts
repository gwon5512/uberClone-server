
export interface MailModuleOptions { // MailModule에서 가져야할 인터페이스 작성
    apiKey:string;
    domain:string; // 메일 송신처 도메인
    fromEmail:string
}