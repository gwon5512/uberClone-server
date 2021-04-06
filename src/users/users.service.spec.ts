import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service";

const mockRepository = () => ({ // user 레포의 create와 verification 레포의 create가 같은 함수라 생각하여 함수리턴
  findOne: jest.fn(), // 가짜함수(사용되었지만?)
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

// 위 처럼 function으로 만들어준다면 새로운 test를 만들때마다 다시 새롭게 만들어진다.

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
                                             //↑Repository의 모든 키 가져오기 ...Record의 프로퍼티는 findOne, save, create, update ...같은 것 그리고 타입은 mock
describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>; // usersRepository 만들기! 그리고 UserRepository의 모든 함수 가져오기!
                       //↑Repository의 모든함수(ALL) 이 함수들의 타입이 jest.Mock 함수 
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;


  // 테스트 하기 이전에 테스트 모듈 만들기
  beforeEach(async () => {
    // 동일한 mock에서 공유하고 있기에 findOne이 많이 불러와짐 beforeEach(각 test전 재생성)로 변경(beforeAll 은 모든 test전에 만들어졌다고 생각)
    const module = await Test.createTestingModule({
      // import 할 모듈(서비스를 모듈 밖으로 불러내기)
      providers: [
        UserService, // 진짜 UsersService를 불러서
        { // 가짜 repository(user,verification), jwtservice,mailservice 제공
          provide: getRepositoryToken(User),
          useValue: mockRepository(), // 함수리턴 verification 과 다른 레포
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(), // 함수리턴 user 와 다른 레포
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],  // 유저서비스만 테스트(graphql, resolver제외하고) => 모든 테스트들은 독립적으로 시행
    }).compile();
    service = module.get<UserService>(UserService); // testing 모듈 .. expect 가능해짐
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 유저 서비스에서 어떤 것을 테스트할지?
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      role: 0,
    };

    it('should fail if user exists', async () => {
      // mock은 함수의 반환값을 속일 수 있다. => createAccount 의 의존관계의 반환값을 mock
      usersRepository.findOne.mockResolvedValue({
        id: 1,                 //↑Promise시 (다른종류도 많음)
        email: '', // findOne 값이 실제 값 대신에 이 값을 리턴
      }); // jest와 mock을 사용해서 디펜던시에 있는 함수의 반환값을 속일 수 있다. => DB에 유저가 있다고 속일 수도 있다(실제 DB접속이나 typeORM을 쓰지 않고도)
      const result = await service.createAccount(createAccountArgs);  // promise 반환
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a new user', async () => { // 함수 자체 테스트 findOne의 리턴 값을 mock
      usersRepository.findOne.mockResolvedValue(undefined); // 서비스에 있는 유저들을 찾았을 때 없다고 함 - 그래야 해당 테스트를 로직 동작함
      usersRepository.create.mockReturnValue(createAccountArgs); // create의 리턴 값을 mock
      usersRepository.save.mockResolvedValue(createAccountArgs); // save의 리턴 값을 mock
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs, //verifications.create 안에 user가 있다. user 안에는 email,password,role 존재
      }); // create의 리턴 값을 mock
      verificationsRepository.save.mockResolvedValue({
        code: 'code', // code가 없기에 같이 return
      }); // return 해주지 않았기에 return value mock
      // 모든 return value 들을 mock 해야 한다!


      // mock 완전히 다 되었다면 service를 호출
      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1); // user 레포의 create는 단 한번 불린다
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs); // 기대값

      expect(usersRepository.save).toHaveBeenCalledTimes(1); // toHaveBeenCalled는 어떤 함수가 호출 되었는지 체크 횟수는 상관하지 않음
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,  // user obj와 불러와져야함
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),  // 어떤 arguments를 사용했는지 확인 -> 2개
      );
      expect(result).toEqual({ ok: true }); // 결과
    });

    it('should fail on exception', async () => { 
      usersRepository.findOne.mockRejectedValue(new Error()); // findOne 이 실패할 경우
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      // 서비스 작성
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    }); // return value mock

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)), // mock function... password 의 true/false
      };
      usersRepository.findOne.mockResolvedValue(mockedUser); // User not found 부분 건너띄고 passwordCorrect 부분으로 바로 전개하여 res 를 mock
      const result = await service.login(loginArgs); // 비밀번호가 틀렸을 시
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)), // 비밀번호가 맞을 때
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number)); // 숫자와 함께 불러와짐
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error()); // findOne 이 실패할 경우
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Can't log user in." });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => { // 유저를 찾은 경우
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs); // findOneorFail mockRepository에 등록
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => { // 유저를 찾지 못한 경우
      usersRepository.findOneOrFail.mockRejectedValue(new Error()); 
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser); // mock -- resolve 할 값은 oldUser
      verificationsRepository.create.mockReturnValue(newVerification);
      // return value 와 resolved value 의 차이는 create는 promise를 return 하지 않는다 save는 promise를 return
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId, // userId와 함께 불러와졌는지 확인
      );

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser, // 업뎃된 user와 함께 불러와져야 함 -> user는 editProfileArgs의 email을 가지게 된다.
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification, // create/save는 newUser와 함께 불러와져야 함.
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' }); // mock - password : old를 return
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1); // 윗 줄 로직이 실행되기 전에 save가 불러와짐
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input); // save가 new.password를 갖는 obj과 불러와지는지 확인
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false, // verification 이 올 때는 user가 verified 되기 전이므로
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification); // result value mock

      const result = await service.verifyEmail(''); // 빈 sting

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object), // 2개의 obj
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);  
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true }); // verified 된 후

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith( // mockRepository에 delete 추가
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined); // findOne을 null로 만들고 null return 을 mock
      const result = await service.verifyEmail(''); // 빈 sting
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
    });

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail(''); 
      expect(result).toEqual({ ok: false, error: 'Could not verify email.' });
    });
  });
});



// 생성시 spec 필수!(jest에서 spec.ts를 찾기 때문에)
// "moduleNameMapper":{
//   "^src/(.*)$":"<rootDir>$1"
// },

// 경로를 어떻게 해석할 지 (jest가 파일을 찾는 방식을 수정)
// src로 시작하는 것이 있으면 우리의 root디렉토리(src)에서 이 경로를 찾는다(정규표현식)

// 각 줄을 고립된 상태에서 테스트 

// npm run test:cov 테스트가 어디까지 커버되는지 - coveragePathIgnorePatterns에 파일을 입력하면 제외하고 테스트





