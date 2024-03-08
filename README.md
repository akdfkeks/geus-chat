## Description

geus-chat은 게스트하우스 숙박 플랫폼 GEUS 의 예약자간 단체 채팅 기능 지원을 위한 프로젝트입니다.

## Features

### HTTP (REST API)

- [ ] 채널 인증용 토큰 발급
- [x] 채널 참여자 조회
- [x] 채널 대화 내역 조회
- [ ] 예약 내역 연동
  - [ ] 채널 생성
  - [ ] 채널 참여
  - [ ] 채널 퇴장

### WebSocket

- [x] 사용자 인증 (JWT 기반)
- [x] 채널 참여자 간 단체 채팅
- [ ] 관리자 <-> 예약자 간 1:1 채팅

## Commit Convention

### Rules

1. 모든 commit은 가능한 한 atomic 해야합니다.
2. feature를 위한 부가적인 요소(type, utility 등)는 해당 feature와 같은 commit에 포함되어야 합니다.

### Tags

1. `feat` 새로운 기능 추가
2. `refact` spec 변경이 없는 code refactor
3. `change` 기획 변경 등으로 인한 code 변경
4. `style` logic 변경이 없는 code styling
5. `fix` 오류 수정
6. `chore` package, script 추가/삭제 등
7. `test` Test 관련 변경
8. `docs` 문서 편집

## Set-up and Run

프로젝트 실행을 위해 아래의 프로그램이 필요합니다.

1. `Node.js` 20.10^
2. `MariaDB` 10.11^
3. `MongoDB` 7.0^
4. `Redis` 7.0^

### Installation

```bash
$ yarn install
$ yarn prisma migrate dev --name init
```

### Set env file {dev|prod}.env

```properties
NODE_PORT=
SOCKET_PORT=
REDIS_HOST=
REDIS_PORT=
DATABASE_URL=
MONGODB_URL=
```

### Running the app

```bash
# development (with watch mode)
$ yarn start:dev

# production mode
$ yarn build && yarn start:prod
```

### Test

```bash
# e2e tests
$ yarn run test:e2e
```
