# GEUS-CHAT
GEUS는 다양한 게스트하우스 정보와 예약 기능등을 제공하는 게스트하우스 전문 숙박 플랫폼입니다.

## 소개

### 설명
GEUS-CHAT은 GEUS의 실시간 채팅 기능을 지원하기 위한 서버입니다. 고객과 호스트 간의 원활한 소통을 위해 기획되었으며, 빠르고 안정적인 메시지 송수신을 목적으로 합니다.  

### Preview
>|        |                                                                                                    |
>| ------ | -------------------------------------------------------------------------------------------------- |
>| Design | [Link](https://github.com/akdfkeks/geus-chat/assets/52886761/c993e641-7fa6-481a-b599-c52f569036de) |
>| Demo   | 준비 중                                                                                            |

### 관련 저장소

채팅 서버 이외의 프로젝트는 아래의 저장소에 위치합니다.

>|             |                                         |
>| ----------------- | ------------------------------------------- |
>| `Main API Server` | [Link](https://github.com/gustjdw/geus-server)|
>| `Android Client`  | [Link](https://github.com/wsb7788/GuestHouse)|
>| `iOS Client`      | [Link](https://github.com/Guboneui/GuestHoust-User)|

### 주요 기능

 > - [x] 클라이언트 인증
 > - [x] 메세지 전송 (Text)
 > - [x] 메세지 전송 (Image)
 >   - [x] 썸네일 생성
 > - [x] 대화내역 저장
 > - [x] 대화내역 조회
 > - [ ] 수평 확장성 지원
 >    - [x] 인스턴스간 메세지 이벤트 공유
 >    - [ ] 지역 캐시 동기화


## Rules

### Commit
Commit은 가능한 한 즉시 반영하더라도 프로그램이 정상적으로 동작할 수 있는 단위로 추가되어야 합니다. 각 Commit은 아래의 Tag를 이용하여 파악하기 쉽도록 작성합니다.

> | Prefix   | Description                     |
> | -------- | ------------------------------- |
> | `feat`   | 새로운 기능 추가                |
> | `refact` | spec 변경이 없는 code refactor  |
> | `change` | 기획 변경 등으로 인한 code 변경 |
> | `style`  | logic 변경이 없는 code styling  |
> | `fix`    | 오류 수정                       |
> | `chore`  | package, script 추가/삭제 등    |
> | `test`   | Test 관련 변경                  |
> | `docs`   | 문서 편집                       |

## 환경 구성 및 실행 

### with Docker

#### 0. Requirements

프로젝트 실행을 위해 아래의 프로그램이 필요합니다.

> _이 항목은 Windows 환경을 기준으로 작성되었습니다_
> | Target           | Version          |
> | ---------------- | ---------------- |
> | `Docker`         | 25.0.3           |
> | `docker-compose` | 2.24.6-desktop.1 |


#### 1. Build 및 실행
`Terminal` 을 실행하고 아래의 명령어를 입력하여 실행합니다.
```powershell
# Docker Image로 빌드합니다.
project_dir > docker buildx build -t NAME:VERSION .

# docker-compose를 이용해 종속 Container와 함께 실행합니다.
project_dir > docker-compose up -d .
```


### without Docker

#### 0. Requirements
프로젝트 실행을 위해 아래의 프로그램이 필요합니다.

> | Target    | Version  |
> | --------- | -------- |
> | `Node.js` | 20.10^   |
> | `Yarn`    | 1.22.19^ |
> | `MariaDB` | 10.11^   |
> | `MongoDB` | 7.0      |
> | `Redis`   | 7.2      |

#### 1. 데이터베이스 생성 및 의존 패키지 설치
`Terminal` 을 실행하고 아래의 명령어를 입력하여 데이터베이스를 생성하고 의존성 패키지를 설치합니다.
```bash
# MariaDB
MariaDB> create database geus;

# Shell
$ yarn install
$ yarn prisma migrate deploy
```

#### 2. 환경변수 설정

실행환경에 맞는 env 파일을 생성하고 아래의 key를 입력한 뒤 적절한 값을 기입합니다.
```properties
# local.env / dev.env / prod.env
NODE_PORT=
REDIS_HOST=
REDIS_PORT=
MONGODB_URL=
AWS.S3.REGION=
AWS.S3.BUCKET=
AWS.S3.BUCKET_RESIZED=
AWS.S3.ACCESS_KEY_ID=
AWS.S3.SECRET_ACCESS_KEY=
```

#### 3. 실행
`Terminal` 에 아래의 명령어를 입력하여 프로젝트를 실행합니다.
```bash
# in local (with watch mode)
$ yarn start:local

# for dev server
$ yarn build && yarn start:dev

# for prod server
$ yarn build && yarn start:prod
```


## 테스트

```bash
# e2e
$ yarn run test:e2e
```
