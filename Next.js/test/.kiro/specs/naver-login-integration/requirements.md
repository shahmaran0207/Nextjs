# 요구사항 문서

## 소개

네이버 OAuth 로그인과 일반 이메일/비밀번호 로그인을 통합하는 기능입니다. 현재 시스템에서는 네이버 로그인이 별도 페이지(`/NaverLogin`)에서 처리되며, 로그인 후 계정이 없으면 닉네임을 입력받아 신규 계정을 생성합니다. 이 기능은 일반 로그인 화면에 네이버 로그인 버튼을 추가하고, 이미 일반 계정이 있는 사용자가 네이버 로그인 시 자동으로 계정을 연동하도록 개선합니다.

## 용어 정의

- **Authentication_System**: 사용자 인증을 처리하는 시스템 (JWT 기반 일반 로그인 + NextAuth 기반 네이버 OAuth)
- **Account_Linker**: 네이버 계정과 기존 일반 계정을 연동하는 컴포넌트
- **Login_UI**: 통합 로그인 화면 (`/Login` 페이지)
- **Naver_OAuth_Provider**: NextAuth를 통한 네이버 OAuth 인증 제공자
- **JWT_Token**: 일반 로그인에서 발급되는 JWT 액세스 토큰 및 리프레시 토큰
- **Session_Token**: NextAuth가 관리하는 세션 토큰 (쿠키 기반)
- **Linked_Account**: 네이버 계정(`naver_id`)과 연동된 일반 계정(`email`, `password`)
- **User_Record**: 데이터베이스의 `users` 테이블 레코드

## 요구사항

### 요구사항 1: 통합 로그인 화면

**사용자 스토리:** 사용자로서, 하나의 로그인 화면에서 일반 로그인과 네이버 로그인을 모두 선택할 수 있기를 원합니다. 이를 통해 로그인 방법을 쉽게 선택할 수 있습니다.

#### 인수 기준

1. THE Login_UI SHALL 이메일/비밀번호 입력 폼을 표시한다
2. THE Login_UI SHALL 네이버 로그인 버튼을 표시한다
3. THE Login_UI SHALL 회원가입 링크를 표시한다

### 요구사항 2: 네이버 로그인 시 계정 조회 및 토큰 발급

**사용자 스토리:** 네이버 로그인 사용자로서, 이미 연동된 계정이 있으면 즉시 로그인되기를 원합니다. 이를 통해 별도의 추가 절차 없이 시스템에 접근할 수 있습니다.

#### 인수 기준

1. WHEN 사용자가 네이버 로그인 버튼을 클릭하면, THE Naver_OAuth_Provider SHALL 네이버 OAuth 인증 흐름을 시작한다
2. WHEN 네이버 인증이 성공하면, THE Authentication_System SHALL 네이버 ID로 데이터베이스에서 User_Record를 조회한다
3. WHEN 연동된 User_Record가 존재하면, THE Authentication_System SHALL JWT_Token을 발급한다
4. WHEN JWT_Token이 발급되면, THE Authentication_System SHALL 사용자를 메인 페이지로 리다이렉트한다

### 요구사항 3: 연동된 계정이 없을 때 자동 연동

**사용자 스토리:** 일반 계정을 가진 사용자로서, 네이버 로그인 시 자동으로 계정이 연동되기를 원합니다. 이를 통해 이후 네이버 로그인으로도 동일한 계정에 접근할 수 있습니다.

#### 인수 기준

1. WHEN 네이버 인증이 성공하고 연동된 User_Record가 없으면, THE Account_Linker SHALL 네이버 프로필에서 이메일을 추출한다
2. WHEN 네이버 이메일과 일치하는 User_Record가 존재하면, THE Account_Linker SHALL 해당 User_Record의 `naver_id` 필드를 업데이트한다
3. WHEN 계정 연동이 완료되면, THE Authentication_System SHALL JWT_Token을 발급한다
4. WHEN JWT_Token이 발급되면, THE Authentication_System SHALL 사용자를 메인 페이지로 리다이렉트한다

### 요구사항 4: 연동 가능한 계정이 없을 때 처리

**사용자 스토리:** 네이버 로그인 사용자로서, 연동 가능한 일반 계정이 없으면 알림을 받기를 원합니다. 이를 통해 먼저 일반 회원가입을 진행할 수 있습니다.

#### 인수 기준

1. WHEN 네이버 인증이 성공하고 연동된 User_Record가 없으며 네이버 이메일과 일치하는 User_Record도 없으면, THE Authentication_System SHALL "연동된 계정이 없습니다" 메시지를 표시한다
2. WHEN 알림 메시지가 표시되면, THE Login_UI SHALL 사용자를 로그인 화면에 유지한다
3. THE Authentication_System SHALL 사용자에게 일반 회원가입을 안내한다

### 요구사항 5: JWT 토큰 발급 및 저장

**사용자 스토리:** 네이버 로그인 사용자로서, 일반 로그인과 동일한 방식으로 인증 토큰을 받기를 원합니다. 이를 통해 시스템의 모든 보호된 리소스에 일관되게 접근할 수 있습니다.

#### 인수 기준

1. WHEN 네이버 로그인이 성공하고 계정이 연동되면, THE Authentication_System SHALL 액세스 토큰을 생성한다
2. WHEN 액세스 토큰이 생성되면, THE Authentication_System SHALL 리프레시 토큰을 생성한다
3. THE Authentication_System SHALL 액세스 토큰을 localStorage에 저장한다
4. THE Authentication_System SHALL 액세스 토큰을 HttpOnly 쿠키에 저장한다
5. THE Authentication_System SHALL 리프레시 토큰을 HttpOnly 쿠키에 저장한다
6. THE Authentication_System SHALL 리프레시 토큰을 데이터베이스의 `refresh_tokens` 테이블에 저장한다

### 요구사항 6: 네이버 로그인 페이지 제거

**사용자 스토리:** 시스템 관리자로서, 중복된 네이버 로그인 페이지를 제거하여 사용자 경험을 단순화하고 싶습니다. 이를 통해 유지보수 부담을 줄이고 일관된 로그인 경험을 제공할 수 있습니다.

#### 인수 기준

1. THE Authentication_System SHALL `/NaverLogin` 페이지를 제거한다
2. THE Authentication_System SHALL `/NaverLogin` 관련 라우팅을 제거한다
3. WHEN 사용자가 `/NaverLogin` 경로에 접근하면, THE Authentication_System SHALL 404 오류를 반환한다

### 요구사항 7: 기존 일반 로그인 기능 유지

**사용자 스토리:** 일반 로그인 사용자로서, 기존 이메일/비밀번호 로그인 기능이 그대로 작동하기를 원합니다. 이를 통해 변경 없이 계속 시스템을 사용할 수 있습니다.

#### 인수 기준

1. WHEN 사용자가 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭하면, THE Authentication_System SHALL 기존 JWT 기반 인증 흐름을 실행한다
2. THE Authentication_System SHALL 이메일로 User_Record를 조회한다
3. THE Authentication_System SHALL bcrypt로 비밀번호를 검증한다
4. WHEN 인증이 성공하면, THE Authentication_System SHALL JWT_Token을 발급한다
5. WHEN JWT_Token이 발급되면, THE Authentication_System SHALL 사용자를 메인 페이지로 리다이렉트한다

### 요구사항 8: 오류 처리

**사용자 스토리:** 사용자로서, 로그인 과정에서 오류가 발생하면 명확한 메시지를 받기를 원합니다. 이를 통해 문제를 이해하고 적절히 대응할 수 있습니다.

#### 인수 기준

1. IF 네이버 OAuth 인증이 실패하면, THEN THE Authentication_System SHALL "네이버 로그인에 실패했습니다" 메시지를 표시한다
2. IF 계정 연동 중 데이터베이스 오류가 발생하면, THEN THE Authentication_System SHALL "계정 연동에 실패했습니다" 메시지를 표시한다
3. IF JWT 토큰 발급이 실패하면, THEN THE Authentication_System SHALL "토큰 발급에 실패했습니다" 메시지를 표시한다
4. IF 네트워크 오류가 발생하면, THEN THE Authentication_System SHALL "네트워크 오류가 발생했습니다" 메시지를 표시한다
5. THE Authentication_System SHALL 모든 오류를 서버 로그에 기록한다
