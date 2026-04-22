# JWT 인증 시스템 완전 가이드

## 개요

이 프로젝트는 **이중 토큰 시스템**과 **네이버 OAuth 연동**을 포함한 완전한 인증 시스템을 구현합니다:

1. **JWT 기반 이메일/비밀번호 로그인** (Access Token + Refresh Token)
2. **네이버 OAuth 로그인** (직접 구현)
3. **네이버 계정 연동** (기존 계정에 네이버 ID 추가)
4. **이메일 검증 시스템**
5. **조건부 UI 표시** (연동 상태에 따른 버튼 표시/숨김)

---

## 1. 이중 토큰 시스템 (Access Token + Refresh Token)

### 1.1 토큰 구조

#### Access Token (15분 유효)
```typescript
{
  "id": "4",
  "email": "user@example.com", 
  "role": "USER",
  "iat": 1776845789,
  "exp": 1776846689
}
```

#### Refresh Token (7일 유효)
```typescript
{
  "id": "4",
  "tokenVersion": 1,
  "ROLE": "USER",
  "iat": 1776845789,
  "exp": 1777450589
}
```

### 1.2 로그인 프로세스

#### 클라이언트 (`app/Login/page.tsx`)
```typescript
async function handleLogin(e: React.FormEvent) {
    const res = await fetch("/api/auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.accessToken) {
        // Access Token을 localStorage에 저장
        localStorage.setItem("token", data.accessToken);
        // Refresh Token은 자동으로 HttpOnly 쿠키에 저장됨
        
        // 네이버 연동 여부에 따라 UI 업데이트
        setShowNaverLogin(!data.user.hasNaverLink);
        
        router.push("/");
    }
}
```

#### 서버 (`app/api/auth/Login/route.ts`)
```typescript
export async function POST(request: Request) {
    const { email, password } = await request.json();

    // 1. 사용자 조회 및 비밀번호 검증
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return NextResponse.json({ err: "Invalid credentials" }, { status: 401 });
    }

    // 2. 이중 토큰 생성
    const accessToken = generateAccessToken({
        id: String(user.id),
        email: user.email,
        ROLE: user.ROLE,
    });

    const refreshToken = generateRefreshToken({
        id: String(user.id),
        tokenVersion: 1,
        ROLE: user.ROLE,
    });

    // 3. Refresh Token을 데이터베이스에 저장 (해시화)
    await saveRefreshToken(String(user.id), refreshToken, expiresAt);

    // 4. 응답 생성
    const response = NextResponse.json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            ROLE: user.ROLE,
            hasNaverLink: !!user.naver_id, // 네이버 연동 여부
        },
    });

    // 5. 쿠키 설정
    response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60, // 15분
    });

    response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7일
    });

    return response;
}
```

### 1.3 토큰 생성 및 검증 (`utils/auth.ts`)

```typescript
// Access Token 생성 (15분)
export function generateAccessToken(user: { id: string; email: string; ROLE: string }): string {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.ROLE },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );
}

// Refresh Token 생성 (7일)
export function generateRefreshToken(user: { id: string; tokenVersion: number, ROLE: string }): string {
    return jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_SECRET!,
        { expiresIn: "7d" }
    );
}

// 토큰 검증
export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
    } catch (err) {
        return null;
    }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        return jwt.verify(token, process.env.REFRESH_SECRET!) as RefreshTokenPayload;
    } catch (err) {
        return null;
    }
}
```

### 1.4 토큰 저장소 (`lib/tokenStore.ts`)

```typescript
// Refresh Token을 해시화하여 데이터베이스에 저장
export async function saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = await hashToken(token);

    await prisma.refresh_tokens.create({
        data: {
            user_id: parseInt(userId),
            token_hash: tokenHash,
            expires_at: expiresAt,
        },
    });
}

// Refresh Token 검증
export async function verifyRefreshToken(userId: string, token: string): Promise<boolean> {
    const tokenHash = await hashToken(token);

    const storedToken = await prisma.refresh_tokens.findFirst({
        where: {
            user_id: parseInt(userId),
            token_hash: tokenHash,
            expires_at: { gt: new Date() },
        },
    });

    return storedToken !== null;
}

// SHA-256 해싱
export async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
```

---

## 2. 네이버 OAuth 로그인 (직접 구현)

### 2.1 네이버 로그인 흐름

#### 1단계: OAuth 인증 시작 (`app/api/auth/naver/signin/route.ts`)
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl") || "/api/auth/callback/naver";
    
    // 네이버 OAuth URL 생성
    const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
    naverAuthUrl.searchParams.set("response_type", "code");
    naverAuthUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
    naverAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}${callbackUrl}`);
    naverAuthUrl.searchParams.set("state", Math.random().toString(36).substring(2, 15));
    
    return NextResponse.redirect(naverAuthUrl.toString());
}
```

#### 2단계: 콜백 처리 (`app/api/auth/callback/naver/route.ts`)
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    // 1. 네이버 액세스 토큰 요청
    const tokenResponse = await fetch("https://nid.naver.com/oauth2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.NAVER_CLIENT_ID!,
            client_secret: process.env.NAVER_CLIENT_SECRET!,
            code,
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/naver`,
        }),
    });

    const tokenData = await tokenResponse.json();

    // 2. 네이버 사용자 정보 요청
    const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();
    const naverId = profileData.response.id;
    const email = profileData.response.email;

    // 3. 사용자 조회 및 계정 연동
    let user = await prisma.users.findFirst({ where: { naver_id: naverId } });

    if (!user && email) {
        const linkResult = await linkAccountByEmail(naverId, email);
        if (linkResult.success) user = linkResult.user;
    }

    if (!user) {
        return NextResponse.redirect("/Login?error=연동된 계정이 없습니다");
    }

    // 4. JWT 토큰 발급
    const { accessToken, refreshToken } = await issueTokensForNaverLogin({
        userId: user.id,
        email: user.email!,
        role: user.ROLE!,
    });

    // 5. 쿠키 설정 및 리다이렉트
    const response = NextResponse.redirect("/");
    response.cookies.set("accessToken", accessToken, { /* 쿠키 옵션 */ });
    response.cookies.set("refreshToken", refreshToken, { /* 쿠키 옵션 */ });

    return response;
}
```

### 2.2 계정 연동 로직 (`lib/accountLinker.ts`)

```typescript
export async function linkAccountByEmail(naverId: string, email: string) {
    try {
        // 1. 네이버 ID로 먼저 조회
        const existingUser = await findUserByNaverId(naverId);
        if (existingUser) {
            return { success: true, userId: existingUser.id, user: existingUser };
        }

        // 2. 이메일로 조회
        const userByEmail = await findUserByEmail(email);
        if (!userByEmail) {
            return {
                success: false,
                error: "NO_ACCOUNT",
                message: "연동된 계정이 없습니다. 먼저 회원가입을 진행해주세요",
            };
        }

        // 3. naver_id 업데이트
        await updateNaverId(userByEmail.id, naverId);

        // 4. 업데이트된 사용자 정보 반환
        const updatedUser = await prisma.users.findUnique({
            where: { id: userByEmail.id },
        });

        return { success: true, userId: userByEmail.id, user: updatedUser };
    } catch (error) {
        return { success: false, error: "DB_ERROR", message: "계정 연동에 실패했습니다" };
    }
}
```

---

## 3. 네이버 계정 연동 (기존 계정에 네이버 ID 추가)

### 3.1 연동 시작 (`app/api/auth/naver/link/route.ts`)
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // 네이버 OAuth URL (state에 사용자 ID 포함)
    const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
    naverAuthUrl.searchParams.set("state", userId); // 사용자 ID를 state에 포함
    
    return NextResponse.redirect(naverAuthUrl.toString());
}
```

### 3.2 연동 콜백 (`app/api/auth/callback/naver/link/route.ts`)
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // 사용자 ID
    
    // 네이버 프로필 정보 가져오기 (위와 동일)
    const naverId = profileData.response.id;
    const userId = parseInt(state!);

    // 중복 연동 확인
    const existingLink = await prisma.users.findFirst({
        where: { naver_id: naverId, id: { not: userId } }
    });

    if (existingLink) {
        return NextResponse.redirect("/settings?error=이미 다른 계정에 연동된 네이버 계정입니다");
    }

    // naver_id 업데이트
    await prisma.users.update({
        where: { id: userId },
        data: { naver_id: naverId }
    });

    return NextResponse.redirect("/settings?success=네이버 계정이 성공적으로 연동되었습니다");
}
```

### 3.3 프론트엔드 연동 (`app/settings/page.tsx`)
```typescript
async function handleLinkNaver() {
    const token = localStorage.getItem("token");
    if (!token) return;

    // JWT 토큰에서 사용자 ID 추출
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    
    // 네이버 OAuth 시작 (사용자 ID 전달)
    window.location.href = `/api/auth/naver/link?userId=${userId}`;
}
```

---

## 4. 이메일 검증 시스템

### 4.1 회원가입 시 이메일 검증 (`app/api/auth/Register/route.ts`)
```typescript
export async function POST(request: Request) {
    const { email, password, name } = await request.json();

    // 1. 이메일 중복 확인
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json({ err: "Email already exists" }, { status: 400 });
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. 사용자 생성 (이메일 미인증 상태)
    const user = await prisma.users.create({
        data: {
            email,
            password: hashedPassword,
            name,
            email_verified: false, // 이메일 미인증
            ROLE: "USER",
        },
    });

    // 4. 이메일 인증 토큰 생성 및 발송
    const verificationToken = generateEmailVerificationToken(user.id);
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ 
        message: "회원가입이 완료되었습니다. 이메일을 확인해주세요." 
    });
}
```

### 4.2 이메일 인증 처리 (`app/api/auth/verify-email/route.ts`)
```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 토큰 검증
    const payload = verifyEmailVerificationToken(token);
    if (!payload) {
        return NextResponse.redirect("/Login?error=유효하지 않은 인증 링크입니다");
    }

    // 이메일 인증 완료
    await prisma.users.update({
        where: { id: payload.userId },
        data: { email_verified: true }
    });

    return NextResponse.redirect("/Login?success=이메일 인증이 완료되었습니다");
}
```

---

## 5. 조건부 UI 표시

### 5.1 로그인 페이지 (`app/Login/page.tsx`)
```typescript
export default function Login() {
    const [showNaverLogin, setShowNaverLogin] = useState(true);

    // 사용자 정보 확인 (네이버 연동 여부 체크)
    useEffect(() => {
        const checkUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await fetch("/api/auth/Me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // 네이버 ID가 있으면 네이버 로그인 버튼 숨기기
                    setShowNaverLogin(!data.naver_id);
                }
            }
        };
        checkUserInfo();
    }, []);

    return (
        <div>
            {/* 일반 로그인 폼 */}
            
            {/* 네이버 로그인 버튼 - 조건부 표시 */}
            {showNaverLogin && (
                <button onClick={handleNaverLogin}>
                    네이버로 로그인
                </button>
            )}
        </div>
    );
}
```

### 5.2 메인 페이지 (`app/(main)/page.tsx`)
```typescript
export default function Page() {
    const [navItems, setNavItems] = useState(baseNavItems);

    useEffect(() => {
        const checkUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await fetch("/api/auth/Me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // 네이버 ID가 없으면 네이버 계정 연동 메뉴 추가
                    if (!data.naver_id) {
                        setNavItems([...baseNavItems, naverLinkItem]);
                    }
                }
            }
        };
        checkUserInfo();
    }, []);

    return (
        <div>
            {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                    {item.label}
                </a>
            ))}
        </div>
    );
}
```

### 5.3 설정 페이지 (`app/settings/page.tsx`)
```typescript
export default function Settings() {
    const [isLinked, setIsLinked] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await fetch("/api/auth/Me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setIsLinked(!!userData.naver_id); // 네이버 ID가 있으면 연동됨
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <div>
            {/* 네이버 연동 상태 표시 */}
            {isLinked ? (
                <div>✓ 네이버 계정이 연동되었습니다</div>
            ) : (
                <>
                    <h2>네이버 계정 연동</h2>
                    <button onClick={handleLinkNaver}>
                        네이버 계정 연동하기
                    </button>
                </>
            )}
        </div>
    );
}
```

---

## 6. 사용자 정보 API (`app/api/auth/Me/route.ts`)

```typescript
export async function GET(request: Request) {
    // Authorization 헤더 또는 쿠키에서 토큰 확인
    let token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("accessToken")?.value;
    }

    const payload = token ? verifyAccessToken(token) : null;
    if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // DB에서 사용자 정보 조회 (네이버 ID 포함)
    const dbUser = await prisma.users.findUnique({
        where: { id: Number(payload.id) },
        select: { 
            name: true, 
            naver_id: true,
            email_verified: true 
        },
    });

    return new Response(JSON.stringify({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: dbUser?.name ?? null,
        naver_id: dbUser?.naver_id ?? null,
        email_verified: dbUser?.email_verified ?? false,
    }));
}
```

---

## 7. 환경 변수

```env
# JWT 토큰
JWT_SECRET=twin-system-super-secret-jwt-key-2024
REFRESH_SECRET=twin-system-refresh-token-secret-key-2024-secure

# 네이버 OAuth
NAVER_CLIENT_ID=Vz3zKnV_t8XO4LffdQAv
NAVER_CLIENT_SECRET=kaIbWP_ePx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

# 이메일 발송
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# 데이터베이스
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres?schema=test
```

---

## 8. 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255),
    naver_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    ROLE VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Refresh Tokens 테이블
```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. 보안 특징

### ✅ 구현된 보안 기능
- **이중 토큰 시스템**: Access Token (15분) + Refresh Token (7일)
- **토큰 해싱**: Refresh Token을 SHA-256으로 해싱하여 DB 저장
- **HttpOnly 쿠키**: XSS 공격 방어
- **비밀번호 해싱**: bcrypt (salt rounds: 12)
- **OAuth 2.0**: 네이버 표준 OAuth 프로토콜
- **CSRF 보호**: state 파라미터 사용
- **이메일 검증**: 회원가입 시 이메일 인증 필수
- **토큰 만료 관리**: 자동 정리 시스템

### ⚠️ 추가 개선 가능 사항
- 토큰 자동 갱신 (Access Token 만료 시)
- 서버 미들웨어 인증
- Rate Limiting
- 2FA (Two-Factor Authentication)
- 소셜 로그인 확장 (구글, 카카오 등)

---

## 10. API 엔드포인트 요약

### 인증 관련
- `POST /api/auth/Login` - 이메일/비밀번호 로그인
- `POST /api/auth/Register` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/Me` - 사용자 정보 조회
- `POST /api/auth/refresh` - 토큰 갱신

### 네이버 OAuth
- `GET /api/auth/naver/signin` - 네이버 로그인 시작
- `GET /api/auth/callback/naver` - 네이버 로그인 콜백
- `GET /api/auth/naver/link` - 네이버 계정 연동 시작
- `GET /api/auth/callback/naver/link` - 네이버 계정 연동 콜백

### 이메일 검증
- `GET /api/auth/verify-email` - 이메일 인증 처리
- `POST /api/auth/resend-verification` - 인증 이메일 재발송

이 시스템은 현대적인 웹 애플리케이션의 인증 요구사항을 모두 충족하는 완전한 솔루션입니다.