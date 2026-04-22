# JWT 액세스/리프레시 토큰 시스템 - 쉬운 가이드

## 🤔 왜 토큰을 두 개로 나누나요?

### 현재 문제점
- **단일 토큰 (1시간 만료)**
  - 토큰이 탈취되면? → 1시간 동안 악용 가능
  - 1시간마다 재로그인? → 사용자 불편
  - 보안 vs 편의성 사이에서 고민

### 해결책: 이중 토큰 시스템
- **액세스 토큰 (15분)**: 짧게 살고, 자주 갱신
- **리프레시 토큰 (7일)**: 길게 살고, 안전하게 보관

**비유:** 
- 액세스 토큰 = 출입증 (15분마다 재발급)
- 리프레시 토큰 = 사원증 (출입증 재발급용, 안전한 곳에 보관)

---

## 📋 전체 흐름 한눈에 보기

```
1. 로그인
   ↓
2. 두 개의 토큰 받음
   - 액세스 토큰 → localStorage에 저장
   - 리프레시 토큰 → 쿠키에 자동 저장 (JavaScript 접근 불가)
   ↓
3. API 요청할 때
   - 액세스 토큰을 헤더에 넣어서 보냄
   ↓
4. 15분 후 액세스 토큰 만료
   - API 요청 → 401 에러
   ↓
5. 자동으로 토큰 갱신
   - 리프레시 토큰으로 새 액세스 토큰 받기
   - 다시 API 요청
   ↓
6. 7일 후 리프레시 토큰도 만료
   - 재로그인 필요
```

---

## 🔄 시나리오별 상세 흐름

### 시나리오 1: 로그인

```
사용자: 이메일/비밀번호 입력
   ↓
서버: 비밀번호 확인
   ↓
서버: 액세스 토큰 생성 (15분 만료)
      { id: "123", email: "user@example.com" }
   ↓
서버: 리프레시 토큰 생성 (7일 만료)
      { id: "123", tokenVersion: 1 }
   ↓
서버: 리프레시 토큰을 해시해서 DB에 저장
   ↓
클라이언트: 응답 받음
   {
     accessToken: "eyJhbGc..." ← localStorage에 저장
   }
   Set-Cookie: refreshToken=eyJhbGc...; HttpOnly ← 브라우저가 자동 저장
```

**결과:**
- localStorage에 액세스 토큰 저장됨
- 쿠키에 리프레시 토큰 저장됨 (JavaScript로 접근 불가)

---

### 시나리오 2: API 요청 (토큰 유효할 때)

```
클라이언트: API 요청
   GET /api/post/list
   Authorization: Bearer eyJhbGc... ← localStorage에서 가져온 액세스 토큰
   ↓
미들웨어: 토큰 검증
   - Authorization 헤더에서 토큰 추출
   - 서명 확인
   - 만료 시간 확인 (15분 안 지났나?)
   ↓
미들웨어: ✅ 토큰 유효!
   - 요청을 API 핸들러로 전달
   ↓
API 핸들러: 데이터 처리 후 응답
   ↓  
클라이언트: 데이터 받음
```

---

### 시나리오 3: API 요청 (토큰 만료됨)

```
클라이언트: API 요청
   GET /api/post/list
   Authorization: Bearer eyJhbGc... ← 15분 지난 토큰
   ↓
미들웨어: 토큰 검증
   - 만료 시간 확인
   ↓
미들웨어: ❌ 토큰 만료!
   - 401 Unauthorized 응답
   ↓
클라이언트: 401 에러 받음
   - "아, 토큰이 만료됐구나"
   ↓
클라이언트: 자동으로 토큰 갱신 시도
   POST /api/auth/refresh
   Cookie: refreshToken=eyJhbGc... ← 브라우저가 자동으로 쿠키 전송
   ↓
서버: 리프레시 토큰 검증
   1. 쿠키에서 리프레시 토큰 추출
   2. 서명 확인
   3. 만료 시간 확인 (7일 안 지났나?)
   4. DB에 해시가 있는지 확인
   ↓
서버: ✅ 리프레시 토큰 유효!
   1. 새 액세스 토큰 생성 (15분)
   2. 새 리프레시 토큰 생성 (7일) ← 토큰 로테이션
   3. 이전 리프레시 토큰 DB에서 삭제
   4. 새 리프레시 토큰 DB에 저장
   ↓
클라이언트: 새 토큰 받음
   {
     accessToken: "eyJnew..." ← localStorage 업데이트
   }
   Set-Cookie: refreshToken=eyJnew... ← 쿠키 업데이트
   ↓
클라이언트: 원래 요청 다시 시도
   GET /api/post/list
   Authorization: Bearer eyJnew... ← 새 액세스 토큰
   ↓
미들웨어: ✅ 토큰 유효!
   ↓
클라이언트: 데이터 받음
```

**사용자 입장:** 아무것도 모르고 자연스럽게 사용!

---

### 시나리오 4: 로그아웃

```
클라이언트: 로그아웃 요청
   POST /api/auth/logout
   Cookie: refreshToken=eyJhbGc...
   ↓
서버: 리프레시 토큰 무효화
   1. 쿠키에서 리프레시 토큰 추출
   2. 토큰 해시 계산
   3. DB에서 해당 토큰 삭제
   ↓
서버: 쿠키 만료
   Set-Cookie: refreshToken=; Max-Age=0
   ↓
클라이언트: localStorage에서 액세스 토큰 삭제
   ↓
클라이언트: 로그인 페이지로 이동
```

---

## 🔐 보안 원리

### 1. 왜 액세스 토큰은 15분만?
- **짧은 수명 = 탈취 피해 최소화**
- 토큰이 탈취되어도 15분 후 자동 만료
- 공격자가 사용할 수 있는 시간이 짧음

### 2. 왜 리프레시 토큰은 쿠키에?
- **HttpOnly 쿠키 = JavaScript 접근 불가**
- XSS 공격으로 토큰을 훔칠 수 없음
- 브라우저만 쿠키를 읽고 전송할 수 있음

### 3. 왜 리프레시 토큰을 해시로 저장?
- **DB 탈취 대비**
- DB가 해킹당해도 원본 토큰을 알 수 없음
- 해시는 역계산 불가능

### 4. 토큰 로테이션이란?
- **리프레시 토큰 사용할 때마다 새로 발급**
- 이전 토큰은 즉시 무효화
- 토큰이 탈취되어도 한 번만 사용 가능

### 5. 재사용 감지란?
- **같은 리프레시 토큰이 5초 내에 두 번 사용되면?**
- 보안 위협으로 판단
- 해당 사용자의 모든 토큰 무효화
- 재로그인 필요

---

## 🏗️ 구조 설명

### 파일 구조
```
Next.js/test/
├── utils/
│   └── auth.ts                    # 토큰 생성/검증 함수
├── lib/
│   └── tokenStore.ts              # DB에 토큰 저장/조회
├── middleware.ts                  # 모든 API 요청 전에 토큰 검증
├── app/api/auth/
│   ├── Login/route.ts             # 로그인 (토큰 발급)
│   ├── refresh/route.ts           # 토큰 갱신
│   └── logout/route.ts            # 로그아웃 (토큰 무효화)
└── prisma/schema.prisma           # refresh_tokens 테이블
```

### 데이터베이스 테이블

**refresh_tokens 테이블:**
```
id          | user_id | token_hash                        | expires_at          | created_at
------------|---------|-----------------------------------|---------------------|-------------------
1           | 123     | a3f5e8d9c2b1...                  | 2024-05-01 10:00:00 | 2024-04-24 10:00:00
2           | 456     | b7c2f1a4e9d3...                  | 2024-05-02 15:30:00 | 2024-04-25 15:30:00
```

---

## 💻 클라이언트 코드 예제

### 로그인
```typescript
async function login(email: string, password: string) {
  const res = await fetch('/api/auth/Login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  const { accessToken } = await res.json()
  
  // localStorage에 액세스 토큰 저장
  localStorage.setItem('token', accessToken)
  
  // 리프레시 토큰은 자동으로 쿠키에 저장됨 (신경 쓸 필요 없음)
}
```

### API 요청 (자동 토큰 갱신 포함)
```typescript
async function fetchWithAuth(url: string) {
  // 1. 액세스 토큰으로 요청
  let res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  
  // 2. 401 에러면 토큰 갱신 시도
  if (res.status === 401) {
    // 토큰 갱신
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // 쿠키 포함
    })
    
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json()
      localStorage.setItem('token', accessToken)
      
      // 3. 새 토큰으로 다시 요청
      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } else {
      // 갱신 실패 → 로그인 페이지로
      window.location.href = '/Login'
      return
    }
  }
  
  return res.json()
}
```

### 로그아웃
```typescript
async function logout() {
  // 서버에 로그아웃 요청 (리프레시 토큰 무효화)
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include' // 쿠키 포함
  })
  
  // localStorage에서 액세스 토큰 삭제
  localStorage.removeItem('token')
  
  // 로그인 페이지로 이동
  window.location.href = '/Login'
}
```

---

## 🎯 핵심 포인트 요약

### 토큰 저장 위치
| 토큰 | 저장 위치 | 이유 |
|------|----------|------|
| 액세스 토큰 | localStorage | API 요청 시 쉽게 접근 |
| 리프레시 토큰 | HttpOnly 쿠키 | JavaScript 접근 차단 (보안) |

### 토큰 수명
| 토큰 | 수명 | 용도 |
|------|------|------|
| 액세스 토큰 | 15분 | API 요청 인증 |
| 리프레시 토큰 | 7일 | 액세스 토큰 갱신 |

### 보안 메커니즘
1. **짧은 액세스 토큰**: 탈취 피해 최소화
2. **HttpOnly 쿠키**: XSS 공격 방어
3. **토큰 해싱**: DB 탈취 대비
4. **토큰 로테이션**: 재사용 방지
5. **재사용 감지**: 보안 위협 차단

---

## 🚀 구현 순서

1. **토큰 생성/검증 함수** (`utils/auth.ts`)
   - generateAccessToken()
   - generateRefreshToken()
   - verifyAccessToken()
   - verifyRefreshToken()

2. **DB 테이블 추가** (`prisma/schema.prisma`)
   - refresh_tokens 테이블

3. **토큰 저장소** (`lib/tokenStore.ts`)
   - 토큰 저장/조회/삭제

4. **로그인 API 수정** (`app/api/auth/Login/route.ts`)
   - 두 개의 토큰 발급

5. **토큰 갱신 API** (`app/api/auth/refresh/route.ts`)
   - 리프레시 토큰으로 새 토큰 발급

6. **로그아웃 API** (`app/api/auth/logout/route.ts`)
   - 토큰 무효화

7. **미들웨어** (`middleware.ts`)
   - 모든 API 요청 전에 토큰 검증

---

## ❓ 자주 묻는 질문

### Q1: 왜 액세스 토큰을 localStorage에 저장하나요? 쿠키가 더 안전하지 않나요?
**A:** 액세스 토큰은 수명이 짧아서 (15분) XSS 공격 위험이 낮습니다. localStorage에 저장하면 API 요청 시 쉽게 접근할 수 있어 편리합니다. 리프레시 토큰만 HttpOnly 쿠키로 보호하면 충분합니다.

### Q2: 토큰 로테이션이 왜 필요한가요?
**A:** 리프레시 토큰이 탈취되어도 한 번만 사용할 수 있도록 제한합니다. 정상 사용자가 토큰을 사용하면 새 토큰이 발급되고 이전 토큰은 무효화됩니다. 공격자가 이전 토큰을 사용하려고 하면 재사용 감지로 차단됩니다.

### Q3: 미들웨어가 모든 요청을 검증하면 성능이 느려지지 않나요?
**A:** JWT 검증은 매우 빠릅니다 (동기 작업). DB 조회 없이 서명만 확인하면 되기 때문에 성능 영향이 거의 없습니다. 리프레시 토큰만 DB 조회가 필요합니다.

### Q4: 사용자가 여러 기기에서 로그인하면 어떻게 되나요?
**A:** 각 기기마다 별도의 리프레시 토큰이 발급됩니다. DB에 여러 개의 토큰이 저장되며, 각 기기에서 독립적으로 토큰을 갱신할 수 있습니다.

### Q5: 7일 후에는 어떻게 되나요?
**A:** 리프레시 토큰이 만료되면 토큰 갱신이 실패하고, 사용자는 재로그인해야 합니다. 이는 보안을 위해 필요한 조치입니다.

---

## 📚 더 알아보기

- [요구사항 문서](./.kiro/specs/jwt-refresh-token/requirements.md)
- [설계 문서](./.kiro/specs/jwt-refresh-token/design.md)
- [작업 목록](./.kiro/specs/jwt-refresh-token/tasks.md)
