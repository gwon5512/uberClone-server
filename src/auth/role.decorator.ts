import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

// 커스터마이징한 decorator 생성

type AllowedRoles = keyof typeof UserRole | 'Any'; // metadata혹은 role이 any면 결과 실행가능... 로그인이 되어야 사용...
export const Role = (roles:AllowedRoles[]) => SetMetadata('roles', roles)

// 사용자가 누구인지에 따라 어떤 resolver들을 제한 하여야한다.