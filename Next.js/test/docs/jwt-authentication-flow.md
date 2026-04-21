# JWT 인증 흐름 정리

## 개요

이 프로젝트는 두 가지 인증 방식을 사용합니다:
1. **JWT 기반 이메일/비밀번호 로그인** (커스텀 구현)
2. **NextAuth 기반 네이버 OAuth 로그인**

---

## 1. JWT 기반 이메일/비밀번호 인증

### 1.1 로그인 프로세스

#### 클라이언트 (`app/Login/page.tsx`)
```typescript
// 1. 사용자가 이메일과 비밀번호 입력
const res = await fetch("/api/auth/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
});

const data = await res.json();

// 2. 서버로부터 JWT 토큰 받아서 localStorage에 저장
if (data.token) {
    localStorage.setItem("token", data.token);
    router.push("/");
}
```

#### 서버 (`app/api/auth/Login/route.ts`)
```typescript
// 1. 이메일로 사용자 조회
const user = await prisma.users.findUnique({ 
    where: { email: String(email) } 
});

// 2. bcrypt로 비밀번호 검증
if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ err: "Invalid credentials" }, { status: 401 });
}

// 3. JWT 토큰 생성 (유효기간 1시간)
const token = generateToken({
    id: String(user.id),
    email: user.email ?? "",
});

return NextResponse.json({ token }, { status: 200 });
```

### 1.2 JWT 토큰 생성 및 검증 (`utils/auth.ts`)

#### 토큰 생성
```typescript
export function generateToken(user: { id: string; email: string }) {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );
}
```

**토큰 페이로드:**
- `id`: 사용자 ID
- `email`: 사용자 이메일
- `expiresIn`: 1시간 후 만료

#### 토큰 검증
```typescript
export function verifyToken(token: string) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        return null;
    }
}
```

### 1.3 인증 확인 프로세스

#### 클라이언트 (`app/(main)/page.tsx`)
```typescript
useEffect(() => {
    const checkAuth = async () => {
        // 1. localStorage에서 토큰 가져오기
        const token = localStorage.getItem("token");
        
        if (!token) {
            window.location.href = "/Login";
            return;
        }

        // 2. /api/auth/Me 엔드포인트로 토큰 검증 요청
        const res = await fetch("/api/auth/Me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 3. 401 응답 시 로그인 페이지로 리다이렉트
        if (res.status === 401) {
            window.location.href = "/Login";
            return;
        }
    };
    checkAuth();
}, []);
```

#### 서버 (`app/api/auth/Me/route.ts`)
```typescript
export async function GET(request: Request) {
    // 1. Authorization 헤더에서 Bearer 토큰 추출
    const token = request.headers.get("Authorization")?.split(" ")[1];
    
    // 2. 토큰 검증
    const user = token ? verifyToken(token) : null;

    if (!user) {
        return new Response(
            JSON.stringify({ error: "Unauthorized" }), 
            { status: 401 }
        );
    }

    // 3. 검증된 사용자 정보 반환
    return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" }
    });
}
```

---

## 2. NextAuth 기반 네이버 OAuth 인증

### 2.1 NextAuth 설정 (`auth.ts`)

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Naver({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
            checks: ["state"]
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // 세션에 네이버 ID와 신규 사용자 여부 추가
            session.user.name = token.name ?? "";
            (session.user as any).naverid = token.naverId;
            (session.user as any).isNewUser = token.isNewUser;
            return session;
        },
        async jwt({ token, profile, trigger }) {
            // JWT 토큰 커스터마이징 로직
            // ...
        }
    }
})
```

### 2.2 네이버 로그인 흐름

1. **최초 로그인 시 (profile 존재)**
   ```typescript
   if (profile) {
       const naverId = (profile as any).response.id;
       token.naverId = naverId;

       // DB에서 네이버 ID로 사용자 조회
       const user = await prisma.users.findFirst({
           where: { naver_id: naverId },
       })

       if(user) {
           token.name = user.name ?? "";
           token.isNewUser = false;
       } else {
           token.isNewUser = true;  // 신규 사용자
       }
   }
   ```

2. **토큰 갱신 시**
   ```typescript
   if (!profile && trigger !== "update" && token.isNewUser && token.naverId) {
       // DB에서 유저 정보 재조회
       const user = await prisma.users.findFirst({
           where: {naver_id: String(token.naverId)},
       });

       if(user) {
           token.name = user.name ?? "";
           token.isNewUser = false;
       }
   }
   ```

3. **세션 업데이트 시**
   ```typescript
   if(trigger ==="update" && token.naverId) {
       const user = await prisma.users.findFirst({
           where: { naver_id: String(token.naverId)},
       });
      
       if(user){
           token.name = user.name ?? "";
           token.isNewUser = false;
       }
   }
   ```

### 2.3 NextAuth API 라우트

```typescript
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@/auth";
```

NextAuth의 모든 인증 관련 요청은 `/api/auth/*` 경로로 처리됩니다.

---

## 3. 인증 흐름 비교

### JWT 이메일/비밀번호 로그인
```
[클라이언트]                    [서버]
    |                              |
    |-- POST /api/auth/Login ----->|
    |   (email, password)           |
    |                               |-- DB 조회 & bcrypt 검증
    |                               |-- JWT 생성 (1시간 유효)
    |<---- { token } --------------|
    |                               |
    |-- localStorage.setItem -------|
    |                               |
    |-- GET /api/auth/Me ---------->|
    |   (Authorization: Bearer)     |
    |                               |-- JWT 검증
    |<---- { user } ----------------|
```

### NextAuth 네이버 OAuth
```
[클라이언트]              [NextAuth]              [네이버]         [DB]
    |                        |                      |              |
    |-- signIn(naver) ------>|                      |              |
    |                        |-- OAuth 요청 ------->|              |
    |                        |<---- 인증 코드 ------|              |
    |                        |-- 토큰 교환 -------->|              |
    |                        |<---- 프로필 ---------|              |
    |                        |                      |              |
    |                        |-- 사용자 조회 ------------------->|
    |                        |<---- 사용자 정보 ----------------|
    |                        |                      |              |
    |                        |-- JWT 생성 (NextAuth)|              |
    |<---- 세션 쿠키 --------|                      |              |
```

---

## 4. 환경 변수

### JWT 인증
```env
JWT_SECRET=your-secret-key-here
```

### NextAuth 네이버 OAuth
```env
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

---

## 5. 보안 고려사항

### JWT 방식
- ✅ 토큰 유효기간: 1시간
- ✅ bcrypt로 비밀번호 해싱
- ⚠️ localStorage 사용 (XSS 취약)
- ⚠️ 토큰 갱신(refresh) 메커니즘 없음
- ⚠️ 서버 측 미들웨어 인증 없음 (클라이언트에서만 체크)

### NextAuth 방식
- ✅ OAuth 2.0 표준 프로토콜
- ✅ 세션 쿠키 기반 (HttpOnly 가능)
- ✅ CSRF 보호 (state 체크)
- ✅ 자동 토큰 갱신

---

## 6. 개선 제안

1. **JWT Refresh Token 구현**
   - Access Token (짧은 유효기간) + Refresh Token (긴 유효기간)
   - 자동 토큰 갱신 메커니즘

2. **HttpOnly 쿠키로 토큰 저장**
   - localStorage 대신 HttpOnly 쿠키 사용
   - XSS 공격 방어

3. **서버 미들웨어 인증**
   - Next.js middleware에서 토큰 검증
   - 보호된 라우트 자동 처리

4. **토큰 블랙리스트**
   - 로그아웃 시 토큰 무효화
   - Redis 등을 활용한 블랙리스트 관리

5. **통합 인증 전략**
   - JWT와 NextAuth를 하나의 전략으로 통합
   - 일관된 세션 관리
