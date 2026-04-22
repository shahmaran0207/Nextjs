# 설계 문서: 네이버 OAuth 로그인 통합

## 개요

이 설계는 기존의 JWT 기반 일반 로그인 시스템과 NextAuth 기반 네이버 OAuth 로그인을 통합합니다. 현재 시스템에서는 두 로그인 방식이 분리되어 있으며, 네이버 로그인은 별도 페이지(`/NaverLogin`)에서 처리됩니다. 이 설계는 다음을 목표로 합니다:

1. **통합 로그인 UI**: 하나의 로그인 페이지에서 일반 로그인과 네이버 로그인을 모두 제공
2. **자동 계정 연동**: 네이버 이메일과 일치하는 일반 계정이 있으면 자동으로 `naver_id` 필드를 업데이트하여 연동
3. **일관된 인증 흐름**: 네이버 로그인 성공 시에도 JWT 토큰을 발급하여 일반 로그인과 동일한 인증 메커니즘 사용
4. **레거시 제거**: 중복된 `/NaverLogin` 페이지 제거

### 핵심 설계 결정

- **이중 인증 시스템 유지**: NextAuth는 네이버 OAuth 인증만 담당하고, 인증 성공 후 JWT 토큰을 발급하여 세션 관리
- **계정 연동 전략**: 네이버 프로필의 이메일을 기준으로 기존 계정을 찾아 `naver_id` 필드를 업데이트
- **토큰 저장 방식**: 액세스 토큰은 localStorage와 HttpOnly 쿠키에 이중 저장, 리프레시 토큰은 HttpOnly 쿠키와 데이터베이스에 저장

## 아키텍처

### 시스템 컴포넌트

```
┌─────────────────────────────────────────────────────────────┐
│                        Login UI                              │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Email/Password   │  │  Naver Login Button          │    │
│  │ Form             │  │  (NextAuth signIn)           │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│  JWT Login API       │    │  NextAuth Callback           │
│  /api/auth/Login     │    │  /api/auth/[...nextauth]     │
└──────────────────────┘    └──────────────────────────────┘
           │                           │
           │                           ▼
           │                ┌──────────────────────────────┐
           │                │  Account Linker Service      │
           │                │  - Check naver_id exists     │
           │                │  - Find by email             │
           │                │  - Update naver_id           │
           │                └──────────────────────────────┘
           │                           │
           └───────────────┬───────────┘
                           ▼
                ┌──────────────────────────────┐
                │  JWT Token Generator         │
                │  - generateAccessToken()     │
                │  - generateRefreshToken()    │
                └──────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │  Token Storage               │
                │  - localStorage              │
                │  - HttpOnly Cookies          │
                │  - Database (refresh_tokens) │
                └──────────────────────────────┘
```

### 인증 흐름

#### 일반 로그인 흐름 (기존 유지)

```
1. 사용자가 이메일/비밀번호 입력
2. POST /api/auth/Login
3. 데이터베이스에서 사용자 조회 (email)
4. bcrypt로 비밀번호 검증
5. JWT 토큰 발급 (액세스 + 리프레시)
6. 토큰 저장 (localStorage, 쿠키, DB)
7. 메인 페이지로 리다이렉트
```

#### 네이버 로그인 흐름 (신규)

```
1. 사용자가 "네이버 로그인" 버튼 클릭
2. NextAuth signIn("naver") 호출
3. 네이버 OAuth 인증 페이지로 리다이렉트
4. 사용자가 네이버에서 인증 승인
5. NextAuth 콜백으로 돌아옴
   ├─ 5a. naver_id로 사용자 조회
   │   └─ 존재하면 → JWT 토큰 발급 → 로그인 완료
   └─ 5b. naver_id로 사용자 없음
       ├─ 네이버 프로필에서 이메일 추출
       ├─ 이메일로 사용자 조회
       │   ├─ 존재하면 → naver_id 업데이트 → JWT 토큰 발급 → 로그인 완료
       │   └─ 없으면 → "연동된 계정이 없습니다" 메시지 → 로그인 화면 유지
```

## 컴포넌트 및 인터페이스

### 1. Login UI Component (`/app/Login/page.tsx`)

**책임**:
- 이메일/비밀번호 입력 폼 렌더링
- 네이버 로그인 버튼 렌더링
- 일반 로그인 API 호출
- NextAuth signIn 호출
- 오류 메시지 표시

**인터페이스**:
```typescript
interface LoginPageProps {}

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    ROLE: string;
  };
}
```

**주요 메서드**:
- `handleEmailLogin(data: LoginFormData): Promise<void>` - 일반 로그인 처리
- `handleNaverLogin(): Promise<void>` - 네이버 로그인 시작 (NextAuth signIn 호출)

### 2. NextAuth Configuration (`/auth.ts`)

**책임**:
- 네이버 OAuth 프로바이더 설정
- JWT 콜백에서 계정 연동 로직 실행
- 세션 콜백에서 사용자 정보 전달

**인터페이스**:
```typescript
interface NaverProfile {
  response: {
    id: string;
    email: string;
    name: string;
  };
}

interface ExtendedToken {
  naverId?: string;
  email?: string;
  name?: string;
  needsLinking?: boolean;
}
```

**주요 콜백**:
- `jwt({ token, profile, account })` - 네이버 인증 후 계정 조회 및 연동
- `session({ session, token })` - 세션에 사용자 정보 추가

### 3. Account Linker Service (`/lib/accountLinker.ts`)

**책임**:
- 네이버 ID로 사용자 조회
- 이메일로 사용자 조회
- `naver_id` 필드 업데이트

**인터페이스**:
```typescript
interface LinkAccountParams {
  naverId: string;
  email: string;
}

interface LinkAccountResult {
  success: boolean;
  userId?: number;
  error?: string;
}
```

**주요 함수**:
```typescript
async function findUserByNaverId(naverId: string): Promise<User | null>
async function findUserByEmail(email: string): Promise<User | null>
async function linkNaverAccount(userId: number, naverId: string): Promise<void>
async function linkAccountByEmail(params: LinkAccountParams): Promise<LinkAccountResult>
```

### 4. JWT Token Issuer (`/lib/jwtIssuer.ts`)

**책임**:
- 네이버 로그인 성공 후 JWT 토큰 발급
- 토큰을 쿠키와 데이터베이스에 저장
- 클라이언트로 토큰 전달

**인터페이스**:
```typescript
interface IssueTokenParams {
  userId: number;
  email: string;
  role: string;
}

interface IssueTokenResult {
  accessToken: string;
  refreshToken: string;
}
```

**주요 함수**:
```typescript
async function issueTokensForNaverLogin(params: IssueTokenParams): Promise<IssueTokenResult>
```

### 5. NextAuth Callback Handler (`/app/api/auth/callback/naver/route.ts`)

**책임**:
- NextAuth 콜백 처리
- 계정 연동 서비스 호출
- JWT 토큰 발급
- 쿠키 설정
- 리다이렉트 처리

**인터페이스**:
```typescript
interface NaverCallbackParams {
  code: string;
  state: string;
}
```

## 데이터 모델

### Users 테이블 (기존)

```prisma
model users {
  id             Int              @id @default(autoincrement())
  name           String?          @db.VarChar(100)
  naver_id       String?          @db.VarChar(3000)  // 네이버 ID 저장
  email          String?          @unique @db.VarChar(255)
  password       String?          @db.VarChar(255)
  ROLE           String?          @db.VarChar(1000)
  refresh_tokens refresh_tokens[]
}
```

**필드 설명**:
- `naver_id`: 네이버 OAuth ID (연동 시 업데이트)
- `email`: 계정 연동의 기준 필드
- `password`: 일반 로그인용 (네이버 전용 계정은 null 가능)

### Refresh Tokens 테이블 (기존)

```prisma
model refresh_tokens {
  id         Int      @id @default(autoincrement())
  user_id    Int
  token_hash String   @db.VarChar(255)
  expires_at DateTime @db.Timestamp(6)
  created_at DateTime @default(now()) @db.Timestamp(6)
  user       users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

## 오류 처리

### 오류 시나리오 및 처리 전략

| 오류 시나리오 | HTTP 상태 | 사용자 메시지 | 로그 |
|--------------|----------|--------------|------|
| 네이버 OAuth 인증 실패 | 401 | "네이버 로그인에 실패했습니다" | ERROR: Naver OAuth failed |
| 네이버 프로필 이메일 없음 | 400 | "네이버 계정에 이메일 정보가 없습니다" | WARN: Naver profile missing email |
| 연동 가능한 계정 없음 | 404 | "연동된 계정이 없습니다. 먼저 회원가입을 진행해주세요" | INFO: No linkable account |
| 데이터베이스 오류 | 500 | "계정 연동에 실패했습니다" | ERROR: DB error during linking |
| JWT 토큰 발급 실패 | 500 | "토큰 발급에 실패했습니다" | ERROR: JWT generation failed |
| 네트워크 오류 | 503 | "네트워크 오류가 발생했습니다" | ERROR: Network error |

### 오류 처리 구현

```typescript
// 네이버 로그인 오류 처리 예시
try {
  const result = await signIn("naver", { redirect: false });
  if (!result?.ok) {
    throw new Error("Naver OAuth failed");
  }
} catch (error) {
  console.error("[NAVER LOGIN ERROR]", error);
  setError("네이버 로그인에 실패했습니다");
}

// 계정 연동 오류 처리 예시
try {
  const linkResult = await linkAccountByEmail({ naverId, email });
  if (!linkResult.success) {
    if (linkResult.error === "NO_ACCOUNT") {
      setError("연동된 계정이 없습니다. 먼저 회원가입을 진행해주세요");
    } else {
      setError("계정 연동에 실패했습니다");
    }
  }
} catch (error) {
  console.error("[ACCOUNT LINKING ERROR]", error);
  setError("계정 연동에 실패했습니다");
}
```

## 테스트 전략

이 기능은 주로 **외부 서비스 통합**(네이버 OAuth), **데이터베이스 작업**, **UI 상호작용**으로 구성되어 있습니다. Property-based testing은 이러한 통합 및 부수 효과 중심의 기능에는 적합하지 않습니다.

### 테스트 접근 방식

#### 1. 단위 테스트 (Unit Tests)

**Account Linker Service 테스트**:
- `findUserByNaverId()`: 네이버 ID로 사용자 조회
- `findUserByEmail()`: 이메일로 사용자 조회
- `linkNaverAccount()`: `naver_id` 필드 업데이트
- `linkAccountByEmail()`: 이메일 기반 계정 연동 로직

**JWT Token Issuer 테스트**:
- `issueTokensForNaverLogin()`: 토큰 생성 및 저장

**테스트 도구**: Jest + Prisma Mock

#### 2. 통합 테스트 (Integration Tests)

**네이버 로그인 흐름 테스트**:
- 네이버 OAuth 콜백 처리
- 계정 연동 및 JWT 토큰 발급
- 쿠키 설정 및 리다이렉트

**일반 로그인 유지 테스트**:
- 기존 이메일/비밀번호 로그인이 정상 작동하는지 확인

**테스트 도구**: Jest + MSW (Mock Service Worker) + Supertest

#### 3. E2E 테스트 (End-to-End Tests)

**시나리오 1: 연동된 계정으로 네이버 로그인**
1. 네이버 로그인 버튼 클릭
2. 네이버 인증 (Mock)
3. 메인 페이지로 리다이렉트 확인
4. JWT 토큰 저장 확인

**시나리오 2: 이메일 일치 계정 자동 연동**
1. 일반 계정 생성 (이메일: test@naver.com)
2. 네이버 로그인 (이메일: test@naver.com)
3. `naver_id` 필드 업데이트 확인
4. JWT 토큰 발급 확인

**시나리오 3: 연동 가능한 계정 없음**
1. 네이버 로그인 (이메일: new@naver.com)
2. "연동된 계정이 없습니다" 메시지 표시 확인
3. 로그인 화면 유지 확인

**테스트 도구**: Playwright 또는 Cypress

#### 4. 접근성 테스트 (Accessibility Tests)

- 로그인 폼의 레이블 및 ARIA 속성 확인
- 키보드 네비게이션 테스트
- 스크린 리더 호환성 테스트

**테스트 도구**: jest-axe

### 테스트 커버리지 목표

- 단위 테스트: 80% 이상
- 통합 테스트: 주요 흐름 100% 커버
- E2E 테스트: 핵심 사용자 시나리오 100% 커버

