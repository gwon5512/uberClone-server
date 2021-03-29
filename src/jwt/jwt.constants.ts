
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS'

// forRoot 의 인수로 넣어준 options: privateKey 값을 CONFIG_OPTIONS 로 참조 할 수 있게 된다.
// Servive에서 CONFIG_OPTIONS 을 Inject 한 후 private readonly options:JwtModuleOptions
// 이 후 options 혹은 this.options 로 privateKey 를 service 에서 다룰 수 있다.