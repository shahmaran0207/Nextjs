# 프로젝트 분석 문서

## 1. 프로젝트 개요

### 기본 정보
- **프로젝트명**: test
- **버전**: 0.1.0
- **프레임워크**: Next.js 16.2.2 (App Router)
- **언어**: TypeScript 5
- **데이터베이스**: PostgreSQL (Prisma ORM)

### 프로젝트 설명
Next.js 기반의 풀스택 웹 애플리케이션으로, 게시판, 실시간 채팅, 지도 기능, 3D 시뮬레이션 등 다양한 기능을 제공하는 종합 플랫폼입니다.

---

## 2. 기술 스택

### 프론트엔드
- **React**: 19.2.4
- **Next.js**: 16.2.2 (App Router)
- **TypeScript**: 5
- **스타일링**: 
  - Tailwind CSS 4
  - shadcn/ui 4.2.0
  - tw-animate-css 1.4.0
  - class-variance-authority 0.7.1

### 백엔드
- **프레임워크**: Next.js API Routes
- **ORM**: Prisma 7.7.0
- **데이터베이스**: PostgreSQL (pg 8.20.0)
- **인증**: NextAuth 5.0.0-beta.30

### 실시간 통신
- **WebSocket**: ws 8.20.0
- **버퍼 최적화**: bufferutil 4.1.0, utf-8-validate 6.0.6

### 지도 및 시각화
- **Kakao Maps**: react-kakao-maps-sdk 1.2.1
- **MapLibre GL**: maplibre-gl 5.21.1
- **React Map GL**: react-map-gl 8.1.0
- **Deck.gl**: 9.2.11 (레이어 기반 시각화)
- **3D**: Three.js 0.183.2, @react-three/fiber 9.5.0, @react-three/drei 10.7.7

### AI/LLM
- **OpenAI SDK**: @ai-sdk/openai 0.0.72
- **AI React**: @ai-sdk/react 0.0.70
- **Vercel AI SDK**: ai 3.4.33

### 외부 서비스 통합
- **Firebase**: 12.11.0 (Storage, FCM)
- **이메일**: 
  - Nodemailer 7.0.13
  - Resend 6.10.0
- **전자세금계산서**: popbill 1.63.0

### API 문서화
- **Swagger**: swagger-jsdoc 6.2.8, swagger-ui-react 5.32.3
- **Next Swagger Doc**: next-swagger-doc 0.4.1

### 유틸리티
- **날짜**: dayjs 1.11.20
- **HTTP**: axios 1.14.0
- **쿠키**: js-cookie 3.0.5
- **아이콘**: lucide-react 1.7.0, react-icons 5.6.0
- **YAML**: yaml 2.8.3

---

## 3. 프로젝트 구조

```
Next.js/test/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── layout.tsx
│   │   └── page.tsx              # 홈페이지
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   ├── Chat/                 # 채팅 API
│   │   │   ├── addChat/
│   │   │   ├── getChat/[userId]/
│   │   │   └── ws/               # WebSocket 서버
│   │   ├── Comment/              # 댓글 API
│   │   │   ├── addComment/[id]/
│   │   │   ├── getEachComment/[id]/
│   │   │   ├── removeComment/[id]/
│   │   │   ├── DownComment/      # 대댓글
│   │   │   ├── Like/             # 댓글 좋아요
│   │   │   └── Hate/             # 댓글 싫어요
│   │   ├── posts/                # 게시글 API
│   │   │   ├── addPost/
│   │   │   ├── getPostList/
│   │   │   ├── updatePost/[id]/
│   │   │   ├── removePost/[id]/
│   │   │   ├── Like/
│   │   │   └── Hate/
│   │   ├── QnA/                  # Q&A API
│   │   │   ├── Question/
│   │   │   └── Answer/
│   │   ├── Users/                # 사용자 API
│   │   │   ├── register/
│   │   │   └── checkName/
│   │   ├── email/                # 이메일 인증
│   │   │   ├── send/
│   │   │   └── verify/
│   │   └── GIS/                  # 지리정보 API
│   │       ├── Busan/
│   │       └── Seoul/
│   ├── chat/                     # 채팅 페이지
│   ├── list/                     # 게시글 목록
│   │   ├── [id]/                 # 게시글 상세
│   │   │   └── _components/
│   │   └── page.tsx
│   ├── write/                    # 게시글 작성
│   ├── updatePost/[id]/          # 게시글 수정
│   ├── QnA/                      # Q&A 페이지
│   ├── map/                      # 지도 페이지
│   ├── digitalTwin/              # 디지털 트윈
│   ├── SeoulTod/                 # 서울 대중교통
│   ├── FCM/                      # Firebase 푸시 알림
│   ├── NaverLogin/               # 네이버 로그인
│   ├── email/                    # 이메일 인증 페이지
│   ├── hook/                     # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useChatState.ts
│   │   ├── usePostState.ts
│   │   ├── useNormalPost.ts
│   │   ├── useQnAState.ts
│   │   ├── useMapData.ts
│   │   ├── useMapFunction.ts
│   │   └── postStyle.ts
│   ├── generated/                # Prisma 생성 파일
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── providers.tsx             # SessionProvider
├── component/                    # 공통 컴포넌트
│   ├── LinkTable.tsx
│   ├── Nav.js
│   └── SocialLogin.tsx
├── components/                   # UI 컴포넌트
├── lib/                          # 유틸리티
│   ├── prisma.ts                 # Prisma 클라이언트
│   └── eamil.ts                  # 이메일 서비스
├── prisma/                       # Prisma 스키마
│   └── schema.prisma
├── public/                       # 정적 파일
├── nginx/                        # Nginx 설정
├── auth.ts                       # NextAuth 설정
├── ecosystem.config.js           # PM2 설정
├── deploy.ps1                    # 배포 스크립트
├── Dockerfile                    # Docker 이미지
├── docker-compose.yml            # Docker Compose
├── next.config.ts                # Next.js 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 의존성
└── .env                          # 환경 변수
```

---

## 4. 데이터베이스 스키마

### 사용자 관리
```prisma
model users {
  id       Int     @id @default(autoincrement())
  name     String? @db.VarChar(100)
  naver_id String? @db.VarChar(3000)
}
```

### 게시글 시스템
```prisma
model post {
  id        Int       @id @default(autoincrement())
  title     String?   @db.VarChar(1000)
  content   String?   @db.VarChar(1000)
  createdat DateTime? @db.Timestamp(6)
  updatedat DateTime? @db.Timestamp(6)
  image     Bytes?
  postview  Int?      @default(0)
}

model postcomment {
  id             Int     @id @default(autoincrement())
  postid         Int?
  commenttitle   String? @db.VarChar(1000)
  commentcontent String? @db.VarChar(1000)
  commentwriter  String? @db.VarChar(100)
}

model commentbycomment {
  id                   Int     @id @default(autoincrement())
  upprcommentid        Int?
  commenttitle         String? @db.VarChar(1000)
  commentcontent       String? @db.VarChar(1000)
  commentwriter        String? @db.VarChar(1000)
  postid               Int?
}
```

### 좋아요/싫어요 시스템
```prisma
model postlike {
  id     Int     @id @default(autoincrement())
  postid Int?
  userid String? @db.VarChar(1000)
}

model posthate {
  id     Int     @id @default(autoincrement())
  postid Int?
  userid String? @db.VarChar(1000)
}

model commentlike {
  id        Int     @id @default(autoincrement())
  commentid Int?  
  userid    String? @db.VarChar(1000)
  postid    Int?
}

model commenthate {
  id        Int     @id @default(autoincrement())
  commentid Int?
  userid    String? @db.VarChar(1000)
  postid    Int?
}
```

### Q&A 시스템
```prisma
model qna {
  id        Int       @id @default(autoincrement())
  title     String?   @db.VarChar(1000)
  content   String?   @db.VarChar(1000)
  createdat DateTime? @db.Timestamp(6)
  image     Bytes?
  qnaview   Int?      @default(0)
  isend     Int?      @default(0)
}

model answer {
  id         Int       @id @default(autoincrement())
  title      String?   @db.VarChar(1000)
  content    String?   @db.VarChar(1000)
  createdat  DateTime? @db.Timestamp(6)
  image      Bytes?
  questionid Int?
}

model questionlike {
  id         Int    @id @default(autoincrement())
  questionid Int
  userid     String @db.VarChar(1000) 
}

model questionhate {
  id         Int    @id @default(autoincrement())
  questionid Int
  userid     String @db.VarChar(1000)
}
```

### 채팅 시스템
```prisma
model chat {
  id        Int     @id @default(autoincrement())
  recepient String? @db.VarChar(1000)
  sender    String? @db.VarChar(1000)
  content   String? @db.VarChar(1000)
  image     Bytes?
}
```

### GIS 데이터
```prisma
model road {
  id       Int     @id @default(autoincrement())
  roadname String? @db.VarChar(600)
}

model section {
  id          Int     @id @default(autoincrement())
  linkid      String? @db.VarChar(4000)
  roadid      Int?
  sectionname String? @db.VarChar(100)
}

model link {
  sectionid Int
  linkid    String   @db.VarChar(100)
  seq       Decimal? @db.Decimal

  @@id([sectionid, linkid])
}
```

---

## 5. 인증 시스템 (NextAuth)

### 설정 (`auth.ts`)
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
            session.user.name = token.name ?? "";
            (session.user as any).naverid = token.naverId;
            (session.user as any).isNewUser = token.isNewUser;
            return session;
        },
        async jwt({ token, profile, trigger }) {
            // JWT 토큰 관리 로직
        }
    }
})
```

### 인증 플로우
1. **네이버 OAuth 로그인**
   - 사용자가 "네이버로 로그인" 클릭
   - NextAuth가 네이버 OAuth 페이지로 리다이렉트
   - 사용자 인증 후 콜백

2. **신규 사용자 처리**
   - JWT 콜백에서 `isNewUser` 플래그 설정
   - 닉네임 입력 모달 표시
   - `/api/Users/register` 호출하여 DB에 저장

3. **세션 관리**
   - JWT 토큰에 `naverId`, `name`, `isNewUser` 저장
   - 세션 콜백에서 토큰 정보를 세션에 추가
   - `update()` 함수로 세션 갱신

---

## 6. 주요 기능

### 6.1 게시판 시스템
- **게시글 CRUD**: 작성, 조회, 수정, 삭제
- **댓글/대댓글**: 계층형 댓글 시스템
- **좋아요/싫어요**: 게시글 및 댓글에 대한 반응
- **조회수**: 게시글 조회수 추적
- **이미지 업로드**: Bytes 타입으로 DB 저장
- **페이지네이션**: 5개씩 페이지 분할

### 6.2 실시간 채팅 (WebSocket)
- **WebSocket 서버**: 포트 3001에서 독립 실행
- **메시지 타입**:
  - `private`: 1:1 개인 메시지
  - `broadcast`: 전체 브로드캐스트
- **이미지 전송**: Base64 인코딩
- **채팅방 관리**: 사용자별 채팅 이력 조회
- **자동 재연결**: 프로토콜 감지 (ws/wss)

### 6.3 Q&A 시스템
- **질문 작성**: 제목, 내용, 이미지
- **답변 작성**: 질문에 대한 답변
- **상태 관리**: `isend` 플래그로 답변 완료 여부
- **좋아요/싫어요**: 질문에 대한 반응

### 6.4 지도 기능
- **Kakao Maps**: 한국 지도 표시
- **MapLibre GL**: 오픈소스 지도 렌더링
- **Deck.gl**: 레이어 기반 데이터 시각화
- **GIS 데이터**: 도로, 구간, 링크 정보

### 6.5 3D 디지털 트윈
- **Three.js**: 3D 렌더링
- **React Three Fiber**: React 통합
- **Drei**: Three.js 헬퍼 컴포넌트

### 6.6 이메일 인증
- **인증 코드 발송**: Nodemailer/Resend
- **코드 검증**: 5분 유효기간
- **Gmail SMTP**: 이메일 전송

### 6.7 Firebase 통합
- **Cloud Messaging**: 푸시 알림
- **Storage**: 파일 저장

---

## 7. API 엔드포인트

### 인증
- `POST /api/auth/[...nextauth]` - NextAuth 핸들러
- `POST /api/Users/register` - 사용자 등록
- `GET /api/Users/checkName` - 닉네임 중복 확인

### 게시글
- `POST /api/posts/addPost` - 게시글 작성
- `GET /api/posts/getPostList` - 게시글 목록
- `GET /api/posts/getPost/[id]` - 게시글 조회
- `POST /api/posts/updatePost/[id]` - 게시글 수정
- `POST /api/posts/removePost/[id]` - 게시글 삭제
- `POST /api/posts/addViewCount/[id]` - 조회수 증가
- `POST /api/posts/Like/addPostLike/[id]` - 좋아요 추가
- `POST /api/posts/Like/removePostLike/[id]` - 좋아요 취소
- `GET /api/posts/Like/getPostLike/[id]` - 좋아요 목록
- `POST /api/posts/Hate/addPostHate/[id]` - 싫어요 추가
- `POST /api/posts/Hate/removePostHate/[id]` - 싫어요 취소

### 댓글
- `POST /api/Comment/addComment/[id]` - 댓글 작성
- `GET /api/Comment/getEachComment/[id]` - 댓글 조회
- `POST /api/Comment/removeComment/[id]` - 댓글 삭제
- `POST /api/Comment/DownComment/addDownComment/[id]` - 대댓글 작성
- `GET /api/Comment/DownComment/getEachComment/[id]` - 대댓글 조회
- `POST /api/Comment/DownComment/removeComment/[id]` - 대댓글 삭제
- `POST /api/Comment/Like/addCommentLike/[id]` - 댓글 좋아요
- `POST /api/Comment/Hate/addCommentHate/[id]` - 댓글 싫어요

### 채팅
- `POST /api/Chat/addChat` - 채팅 메시지 저장
- `GET /api/Chat/getChat/[userId]` - 채팅 이력 조회
- `GET /api/Chat/ws` - WebSocket 서버 초기화

### Q&A
- `POST /api/QnA/Question/addQuestion` - 질문 작성
- `GET /api/QnA/Question/getQuestionList` - 질문 목록
- `POST /api/QnA/Answer/addAnswer/[id]` - 답변 작성
- `GET /api/QnA/Answer/getAnswer/[id]` - 답변 조회

### 이메일
- `POST /api/email/send` - 인증 코드 발송
- `POST /api/email/verify` - 인증 코드 검증

---

## 8. 커스텀 훅

### useAuth
```typescript
// 인증 관련 상태 및 함수
- handleSend(): 이메일 인증 코드 발송
- handleVerify(): 인증 코드 검증
- checkDuplicate(): 닉네임 중복 확인
- handleRegister(): 사용자 등록
```

### useChatState
```typescript
// 채팅 상태 관리
- connectWebSocket(): WebSocket 연결
- sendMessage(): 메시지 전송
- handleRoomSelect(): 채팅방 선택
- handleImageChange(): 이미지 업로드
```

### usePostState
```typescript
// 게시글 상태 관리
- reloadPostLikeAndHate(): 좋아요/싫어요 갱신
- reloadComment(): 댓글 갱신
- handleSubmit(): 댓글 작성
- handleDelete(): 게시글 삭제
- handleLike(): 좋아요 토글
- handleHate(): 싫어요 토글
```

### useNormalPost
```typescript
// 게시글 목록 관리
- getList(): 게시글 목록 조회
```

### useQnAState
```typescript
// Q&A 상태 관리
- 질문/답변 CRUD 함수
```

### postStyle
```typescript
// 다크 테마 스타일 객체
const dark = {
  bg: "#0f1117",
  surface: "#1a1d27",
  textPrimary: "#e8eaf0",
  accent: "#7c6af7",
  // ...
}
```

---

## 9. 배포 전략

### Blue-Green 배포
- **Blue 슬롯**: 포트 3000
- **Green 슬롯**: 포트 3001
- **Nginx**: 리버스 프록시 (포트 80, 443)

### 배포 프로세스 (`deploy.ps1`)
1. **빌드**: `npm run build`
2. **앱 시작**: PM2로 새 슬롯 시작
3. **헬스 체크**: 10회 재시도 (3초 간격)
4. **Nginx 업데이트**: 트래픽을 새 슬롯으로 전환
5. **이전 앱 중지**: 이전 슬롯 종료

### Docker 구성
```dockerfile
# 멀티 스테이지 빌드
FROM node:22-alpine AS base
FROM base AS deps      # 의존성 설치
FROM base AS builder   # 빌드
FROM base AS runner    # 실행

# 보안 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 10. 환경 변수

### 데이터베이스
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres?schema=TEST
```

### 인증
```env
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

### 이메일
```env
MAIL_USER=...
MAIL_PASS=...
RESEND_API_KEY=...
```

### Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 지도 API
```env
NEXT_PUBLIC_KAKAO_MAP_KEY=...
VWORLD_API_KEY=...
NEXT_PUBLIC_MAPTILER_KEY=...
```

### 기타
```env
BASE_URL=https://localhost
DATA_API_KEY=...
BUSAN_TRAFFIC_KEY=...
TDATA_API_KEY=...
```

---

## 11. 스타일링

### Tailwind CSS 설정
- **버전**: 4
- **플러그인**: @tailwindcss/postcss
- **테마**: 다크/라이트 모드
- **색상 시스템**: OKLch

### 커스텀 CSS 변수
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --accent: oklch(0.97 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --accent: oklch(0.269 0 0);
}
```

### shadcn/ui 컴포넌트
- Button, Card, Input, Dialog 등
- Radix UI 기반
- 커스터마이징 가능

---

## 12. 개발 가이드

### 로컬 개발 환경 설정
```bash
# 의존성 설치
npm install --legacy-peer-deps

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint
```

### Prisma 사용
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션
npx prisma migrate dev

# Prisma Studio
npx prisma studio
```

### PM2 사용
```bash
# 앱 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 앱 중지
pm2 stop all
```

---

## 13. 주요 특징 요약

✅ **모던 스택**: Next.js 16, React 19, TypeScript 5
✅ **풀스택**: API Routes + Prisma ORM
✅ **실시간**: WebSocket 채팅
✅ **인증**: NextAuth + Naver OAuth
✅ **게시판**: CRUD + 댓글 + 좋아요/싫어요
✅ **지도**: Kakao Maps + MapLibre + Deck.gl
✅ **3D**: Three.js + React Three Fiber
✅ **AI**: OpenAI SDK 통합
✅ **이메일**: Nodemailer + Resend
✅ **Firebase**: Storage + FCM
✅ **배포**: Blue-Green + Docker + PM2
✅ **API 문서**: Swagger
✅ **스타일**: Tailwind CSS 4 + shadcn/ui

---

## 14. 향후 개선 사항

### 성능 최적화
- [ ] 이미지 최적화 (Next.js Image 컴포넌트)
- [ ] 코드 스플리팅 강화
- [ ] 캐싱 전략 (Redis)
- [ ] CDN 통합

### 보안 강화
- [ ] CSRF 토큰
- [ ] Rate Limiting
- [ ] SQL Injection 방어
- [ ] XSS 방어

### 기능 추가
- [ ] 검색 기능
- [ ] 알림 시스템
- [ ] 사용자 프로필
- [ ] 관리자 대시보드

### 테스트
- [ ] 단위 테스트 (Jest)
- [ ] 통합 테스트
- [ ] E2E 테스트 (Playwright)

### 모니터링
- [ ] 에러 추적 (Sentry)
- [ ] 성능 모니터링
- [ ] 로그 수집

---

## 15. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [NextAuth 공식 문서](https://next-auth.js.org)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)

---

**문서 작성일**: 2026-04-16
**작성자**: Kiro AI
**버전**: 1.0.0
