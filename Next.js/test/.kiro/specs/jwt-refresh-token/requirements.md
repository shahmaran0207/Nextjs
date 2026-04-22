# 요구사항 문서

## 소개

현재 시스템은 단일 JWT 토큰(1시간 만료)을 사용하여 인증을 처리합니다. 이 기능은 보안성과 사용자 경험을 개선하기 위해 액세스 토큰(Access Token)과 리프레시 토큰(Refresh Token)으로 분리된 이중 토큰 시스템을 구현합니다. Next.js 미들웨어를 활용하여 토큰 검증 및 자동 갱신 로직을 중앙화합니다.

## 용어 정의

- **Authentication_System**: 사용자 인증 및 토큰 관리를 담당하는 시스템
- **Access_Token**: 짧은 수명(15분)을 가진 JWT 토큰으로, API 요청 시 사용자 인증에 사용됨
- **Refresh_Token**: 긴 수명(7일)을 가진 JWT 토큰으로, 액세스 토큰 갱신에만 사용됨
- **Token_Pair**: 액세스 토큰과 리프레시 토큰의 조합
- **Middleware**: Next.js의 요청 처리 파이프라인에서 라우트 핸들러 실행 전에 실행되는 코드
- **Token_Rotation**: 리프레시 토큰 사용 시 새로운 리프레시 토큰을 발급하여 이전 토큰을 무효화하는 보안 메커니즘
- **HttpOnly_Cookie**: JavaScript로 접근할 수 없는 쿠키로, XSS 공격으로부터 토큰을 보호함
- **Token_Store**: 발급된 리프레시 토큰을 저장하고 관리하는 데이터베이스 테이블

## 요구사항

### 요구사항 1: 이중 토큰 생성

**사용자 스토리:** 개발자로서, 로그인 시 액세스 토큰과 리프레시 토큰이 모두 생성되기를 원합니다. 이를 통해 보안성과 사용자 경험을 모두 개선할 수 있습니다.

#### 인수 기준

1. WHEN 사용자가 성공적으로 로그인하면, THE Authentication_System SHALL 15분 만료 시간을 가진 Access_Token을 생성한다
2. WHEN 사용자가 성공적으로 로그인하면, THE Authentication_System SHALL 7일 만료 시간을 가진 Refresh_Token을 생성한다
3. THE Authentication_System SHALL Access_Token에 사용자 ID와 이메일을 페이로드로 포함한다
4. THE Authentication_System SHALL Refresh_Token에 사용자 ID와 토큰 버전을 페이로드로 포함한다
5. WHEN Token_Pair가 생성되면, THE Authentication_System SHALL Refresh_Token을 Token_Store에 저장한다

### 요구사항 2: 토큰 저장 및 전송

**사용자 스토리:** 개발자로서, 토큰이 안전하게 저장되고 전송되기를 원합니다. 이를 통해 XSS 및 CSRF 공격으로부터 보호할 수 있습니다.

#### 인수 기준

1. WHEN Token_Pair가 생성되면, THE Authentication_System SHALL Refresh_Token을 HttpOnly_Cookie로 클라이언트에 전송한다
2. WHEN Token_Pair가 생성되면, THE Authentication_System SHALL Access_Token을 응답 본문(JSON)으로 클라이언트에 전송한다
3. THE Authentication_System SHALL HttpOnly_Cookie에 Secure 플래그를 설정한다
4. THE Authentication_System SHALL HttpOnly_Cookie에 SameSite=Strict 속성을 설정한다
5. THE Authentication_System SHALL HttpOnly_Cookie의 경로를 루트("/")로 설정한다

### 요구사항 3: 미들웨어 기반 토큰 검증

**사용자 스토리:** 개발자로서, Next.js 미들웨어를 통해 모든 보호된 API 라우트에서 자동으로 토큰을 검증하기를 원합니다. 이를 통해 중복 코드를 제거하고 일관된 인증 로직을 유지할 수 있습니다.

#### 인수 기준

1. WHEN 보호된 API 라우트로 요청이 들어오면, THE Middleware SHALL Authorization 헤더에서 Access_Token을 추출한다
2. WHEN Access_Token이 유효하면, THE Middleware SHALL 요청을 라우트 핸들러로 전달한다
3. WHEN Access_Token이 없거나 유효하지 않으면, THE Middleware SHALL 401 Unauthorized 응답을 반환한다
4. THE Middleware SHALL 인증이 필요한 라우트 패턴을 설정 파일에서 정의한다
5. THE Middleware SHALL 공개 라우트(로그인, 회원가입)는 검증 없이 통과시킨다

### 요구사항 4: 액세스 토큰 자동 갱신

**사용자 스토리:** 사용자로서, 액세스 토큰이 만료되었을 때 자동으로 갱신되기를 원합니다. 이를 통해 재로그인 없이 서비스를 계속 사용할 수 있습니다.

#### 인수 기준

1. WHEN 클라이언트가 토큰 갱신 엔드포인트를 호출하면, THE Authentication_System SHALL 쿠키에서 Refresh_Token을 추출한다
2. WHEN Refresh_Token이 유효하고 Token_Store에 존재하면, THE Authentication_System SHALL 새로운 Access_Token을 생성한다
3. WHEN Refresh_Token이 유효하고 Token_Store에 존재하면, THE Authentication_System SHALL 새로운 Refresh_Token을 생성한다(Token_Rotation)
4. WHEN 새로운 Token_Pair가 생성되면, THE Authentication_System SHALL 이전 Refresh_Token을 Token_Store에서 제거한다
5. WHEN 새로운 Token_Pair가 생성되면, THE Authentication_System SHALL 새로운 Refresh_Token을 Token_Store에 저장한다
6. IF Refresh_Token이 유효하지 않거나 Token_Store에 없으면, THEN THE Authentication_System SHALL 401 Unauthorized 응답을 반환한다

### 요구사항 5: 로그아웃 처리

**사용자 스토리:** 사용자로서, 로그아웃 시 모든 토큰이 무효화되기를 원합니다. 이를 통해 보안을 강화할 수 있습니다.

#### 인수 기준

1. WHEN 사용자가 로그아웃하면, THE Authentication_System SHALL 쿠키에서 Refresh_Token을 추출한다
2. WHEN Refresh_Token이 존재하면, THE Authentication_System SHALL 해당 토큰을 Token_Store에서 제거한다
3. WHEN 로그아웃이 처리되면, THE Authentication_System SHALL HttpOnly_Cookie를 만료시킨다
4. WHEN 로그아웃이 처리되면, THE Authentication_System SHALL 성공 응답을 반환한다
5. IF Refresh_Token이 이미 존재하지 않으면, THEN THE Authentication_System SHALL 여전히 성공 응답을 반환한다

### 요구사항 6: 토큰 저장소 관리

**사용자 스토리:** 개발자로서, 리프레시 토큰을 데이터베이스에 안전하게 저장하고 관리하기를 원합니다. 이를 통해 토큰 무효화 및 보안 감사를 수행할 수 있습니다.

#### 인수 기준

1. THE Authentication_System SHALL Token_Store 테이블에 사용자 ID, 토큰 해시, 생성 시간, 만료 시간을 저장한다
2. THE Authentication_System SHALL Refresh_Token을 평문이 아닌 해시 값으로 Token_Store에 저장한다
3. WHEN Refresh_Token을 검증할 때, THE Authentication_System SHALL 제공된 토큰의 해시를 Token_Store의 해시와 비교한다
4. THE Authentication_System SHALL 만료된 토큰을 Token_Store에서 정기적으로 삭제하는 기능을 제공한다
5. WHEN 사용자가 여러 기기에서 로그인하면, THE Authentication_System SHALL 각 기기별로 별도의 Refresh_Token을 Token_Store에 저장한다

### 요구사항 7: 에러 처리 및 보안

**사용자 스토리:** 개발자로서, 토큰 관련 에러가 명확하게 처리되고 보안 위협이 차단되기를 원합니다. 이를 통해 시스템의 안정성과 보안성을 보장할 수 있습니다.

#### 인수 기준

1. WHEN 토큰 검증이 실패하면, THE Authentication_System SHALL 구체적인 실패 이유를 로그에 기록한다
2. WHEN 토큰 검증이 실패하면, THE Authentication_System SHALL 클라이언트에게는 일반적인 에러 메시지만 반환한다
3. IF 동일한 Refresh_Token이 짧은 시간 내에 여러 번 사용되면, THEN THE Authentication_System SHALL 해당 사용자의 모든 Refresh_Token을 무효화한다
4. WHEN JWT 서명 검증이 실패하면, THE Authentication_System SHALL 401 Unauthorized 응답을 반환한다
5. THE Authentication_System SHALL 환경 변수에서 JWT_SECRET과 REFRESH_SECRET을 별도로 관리한다

### 요구사항 8: 기존 시스템과의 호환성

**사용자 스토리:** 개발자로서, 기존 인증 시스템에서 새로운 이중 토큰 시스템으로 원활하게 마이그레이션하기를 원합니다. 이를 통해 서비스 중단 없이 업그레이드할 수 있습니다.

#### 인수 기준

1. THE Authentication_System SHALL 기존 generateToken 함수를 generateAccessToken과 generateRefreshToken으로 분리한다
2. THE Authentication_System SHALL 기존 verifyToken 함수를 verifyAccessToken과 verifyRefreshToken으로 분리한다
3. WHEN 기존 단일 토큰이 요청에 포함되면, THE Middleware SHALL 해당 토큰을 여전히 검증한다(하위 호환성)
4. THE Authentication_System SHALL 로그인 API 응답 형식을 { token, refreshToken } 구조로 변경한다
5. THE Authentication_System SHALL 기존 /api/auth/Me 엔드포인트가 새로운 토큰 시스템에서도 동작하도록 유지한다
