import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

// 커스터마이징한 decorator 생성

export type AllowedRoles = keyof typeof UserRole | 'Any'; // metadata혹은 role이 any면 결과 실행가능... 로그인이 되어야 사용...
// roles의 옵션 any(로그인상태), client, delivery, owner
export const Role = (roles:AllowedRoles[]) => SetMetadata('roles', roles) // metadata 설정... metadata는 resolver의 extra data
// decorator를 리턴하는 decorator생성

// 사용자가 누구인지에 따라 어떤 resolver들을 제한 하여야한다.

// metadata 가 설정한다면 user authentication을 고려한다 뜻... metadata 설정이 필요없다는 것은 로그인여부에 관심이없다는 뜻으로 해석

// createAccount, login 에서는 metadata 필요 없음(모두사용가능)

// metadata를 가지지 않은 resolver
// metadata를 가지는 resolver
// metadata를 가지는 resolver 중에서도 role 이라는 key 