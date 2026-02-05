# StoryRelay (각자) 구현 로드맵

> **목적**: 샘플 데이터 기반 UI를 Supabase + AI 연동 실제 구현으로 전환  
> **범위**: Phase 1 핵심 기능 (PRD 기준)  
> **승인 후 구현 진행**

---

## 1. 현재 상태 분석

### 1.1 완료된 항목
- [x] DB 스키마 설계 및 마이그레이션 (`supabase/migrations/001_initial_schema.sql`)
- [x] `lib/types.ts` DB 스키마 타입 + UI 타입 정의
- [x] 페이지 구조 (홈, 완성작품, 챌린지, 랭킹, 프로필, 스토리 상세/생성)
- [x] UI 컴포넌트 (StoryCard, ParagraphCard, WritingEditor, WritingGuide 등)
- [x] `.env.local` Supabase URL/Anon Key/Service Role 설정
- [x] ThemeProvider (다크 모드)

### 1.2 미구현 항목
- [ ] Supabase 클라이언트 설치 및 초기화
- [ ] Supabase Auth (로그인/회원가입)
- [ ] DB 연동 (모든 데이터가 `lib/sample-data.ts` 하드코딩)
- [ ] Lock 시스템 (RPC)
- [ ] AI 작성 가이드 API
- [ ] Server Actions / API Routes

---

## 2. Step-by-Step 구현 계획

---

### Phase A: Supabase 기반 인프라 구축

#### Step A-1. Supabase 클라이언트 설정
**목표**: Supabase SDK 설치 및 클라이언트 초기화

| 작업 | 상세 |
|------|------|
| 패키지 설치 | `pnpm add @supabase/supabase-js` |
| 클라이언트 생성 | `lib/supabase/client.ts` - 브라우저용 (anon key) |
| 서버 클라이언트 | `lib/supabase/server.ts` - Server Components/Server Actions용 (cookies) |
| 미들웨어 | `middleware.ts` - 세션 갱신 (선택) |

**참고**: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용

---

#### Step A-2. DB 마이그레이션 적용
**목표**: Supabase 프로젝트에 스키마 반영

| 작업 | 상세 |
|------|------|
| 로컬 Supabase (선택) | `supabase init` → `supabase start` |
| 마이그레이션 적용 | Supabase Dashboard SQL Editor에 `001_initial_schema.sql` 실행 또는 `supabase db push` |
| 검증 | profiles, story_rooms, story_turns 등 테이블 생성 확인 |

---

#### Step A-3. RLS 보완 및 RPC 함수 추가
**목표**: Lock/좋아요 등 트랜잭션 로직을 RPC로 처리

| 작업 | 상세 |
|------|------|
| `story_rooms` UPDATE 정책 | Lock 해제·preview 갱신을 위해 Lock 보유자 또는 턴 제출자 UPDATE 허용 (또는 RPC로 처리) |
| RPC: `check_and_acquire_lock` | `(room_id, user_id)` → Lock 획득/거부 반환 |
| RPC: `submit_turn` | Lock 검증 + `story_turns` INSERT + `story_rooms` UPDATE (lock 해제, preview, total_authors) |
| RPC: `toggle_turn_like` | `turn_likes` INSERT/DELETE + `story_turns.like_count` 갱신 |
| RPC: `toggle_story_like` | `story_likes` INSERT/DELETE + `story_rooms.like_count` 갱신 |

**마이그레이션 파일**: `supabase/migrations/002_rpc_functions.sql` (신규)

---

### Phase B: 인증 (Supabase Auth)

#### Step B-1. AuthProvider 및 로그인 UI
**목표**: Supabase Auth 기반 인증 상태 관리 및 로그인/회원가입 UI

| 작업 | 상세 |
|------|------|
| AuthProvider | `components/providers/AuthProvider.tsx` - `supabase.auth.getSession()`, `onAuthStateChange` |
| useAuth 훅 | `user`, `isLoggedIn`, `login`, `signup`, `logout`, `showLoginModal`, `setShowLoginModal` |
| LoginModal | `components/auth/LoginModal.tsx` - `supabase.auth.signInWithPassword`, `signUp` |
| layout.tsx | `AuthProvider`로 앱 래핑 |
| Header | 로그인 시 사용자 메뉴, 비로그인 시 "로그인" 버튼 → LoginModal 오픈 |

**참고**: `_mockup/components/auth-provider.tsx`, `login-modal.tsx` 구조 참고

---

#### Step B-2. 보호된 라우트 및 리다이렉트
**목표**: 인증 필요한 페이지 보호

| 작업 | 상세 |
|------|------|
| 보호 대상 | `/story/create`, `/profile`, `/profile/settings` |
| 처리 방식 | 비로그인 시 LoginModal 표시 또는 `/` 리다이렉트 |
| 이어쓰기 버튼 | 비로그인 클릭 시 LoginModal, 로그인 시 Lock 획득 시도 |

---

### Phase C: 스토리 CRUD (Supabase 연동)

#### Step C-1. 스토리 생성 (Server Action)
**목표**: `/story/create` 폼 제출 시 DB에 저장

| 작업 | 상세 |
|------|------|
| Server Action | `actions/story.ts` - `createStory({ title, genre, firstParagraph, tags })` |
| 로직 | 1) `story_rooms` INSERT 2) `story_turns` INSERT (turn_index=1) 3) preview 업데이트 |
| create 페이지 | `handleSubmit`에서 `createStory` 호출 후 `/story/[id]`로 이동 |
| 에러 처리 | Zod 검증, 토스트 알림 |

---

#### Step C-2. 스토리 목록 조회 (홈)
**목표**: `StoryList`를 Supabase `story_rooms` 데이터로 교체

| 작업 | 상세 |
|------|------|
| 데이터 페칭 | Server Component 또는 `useEffect` + Supabase `from('story_rooms')` |
| 필터 | `genre`, `tags` (contains), `title`/`preview` (ilike) |
| 정렬 | `created_at`, `like_count` |
| 페이지네이션 | `range(offset, offset+ITEMS_PER_PAGE-1)` |
| 매핑 | `DbStoryRoom` → `Story` (turns는 `story_turns` count) |

---

#### Step C-3. 스토리 상세 조회
**목표**: `/story/[id]`에서 DB 기반 상세 데이터 로드

| 작업 | 상세 |
|------|------|
| 데이터 페칭 | `story_rooms` + `story_turns` (room_id, order by turn_index) |
| profiles 조인 | `author_id` → `profiles` (display_name, avatar_url) |
| Paragraph 매핑 | `DbStoryTurn` + `DbProfile` → `Paragraph` |
| 404 처리 | room 없을 시 notFound 또는 에러 UI |

---

#### Step C-4. 이어쓰기 + Lock 시스템
**목표**: Lock 획득 → 턴 작성 → 제출

| 작업 | 상세 |
|------|------|
| Lock 획득 | Server Action `acquireLock(roomId)` → RPC `check_and_acquire_lock` 호출 |
| WritingEditor | `roomId` prop 추가, "이어쓰기 시작" 클릭 시 `acquireLock` 호출 |
| Lock 실패 UI | "다른 사용자가 작성 중입니다" 메시지, Lock 보유자/만료 시간 표시 |
| 턴 제출 | Server Action `submitTurn(roomId, content)` → RPC `submit_turn` 호출 |
| 제출 후 | Lock 해제, 새 턴 반영, 페이지 리프레시 또는 낙관적 업데이트 |

---

### Phase D: 좋아요 시스템

#### Step D-1. 턴 좋아요
**목표**: `ParagraphCard` 좋아요 버튼 → DB 연동

| 작업 | 상세 |
|------|------|
| Server Action | `toggleTurnLike(turnId)` → RPC `toggle_turn_like` |
| ParagraphCard | `turnId` prop, `isLiked` 초기값 = 현재 사용자 좋아요 여부 |
| 낙관적 업데이트 | 클릭 시 즉시 UI 반영, 실패 시 롤백 |

---

#### Step D-2. 스토리 좋아요
**목표**: `StoryActionBar` 스토리 단위 좋아요

| 작업 | 상세 |
|------|------|
| Server Action | `toggleStoryLike(roomId)` → RPC `toggle_story_like` |
| StoryActionBar | `roomId`, `isLiked` prop, 좋아요 수 표시 |

---

### Phase E: AI 작성 가이드

#### Step E-1. OpenAI API 연동
**목표**: 스토리 톤 분석 및 작성 팁 제공

| 작업 | 상세 |
|------|------|
| 패키지 | `pnpm add openai` |
| 환경 변수 | `OPENAI_API_KEY` (.env.local) |
| API Route | `app/api/guide/route.ts` - POST, `roomId` 또는 `turns[]` body |
| 로직 | 1) 최근 N턴 조회 (Supabase) 2) OpenAI GPT-4o-mini 호출 3) 톤 분석 + 작성 팁 + 문장 제안 반환 |

---

#### Step E-2. WritingGuide 컴포넌트 연동
**목표**: 하드코딩된 가이드를 API 응답으로 교체

| 작업 | 상세 |
|------|------|
| props | `roomId` 추가 |
| API 호출 | "가이드 불러오기" 또는 자동 로드 시 `fetch('/api/guide', { method: 'POST', body: JSON.stringify({ roomId }) })` |
| 로딩/에러 | 스피너, 에러 시 재시도 버튼 |
| 표시 | 톤, 페이스, 다음 방향, 문장 제안 |

---

### Phase F: 완성 작품 갤러리

#### Step F-1. 완성 작품 목록
**목표**: `is_completed = true` 스토리만 조회

| 작업 | 상세 |
|------|------|
| completed 페이지 | Supabase `story_rooms` WHERE `is_completed = true` |
| 필터/정렬 | genre, search, completed_at, like_count, total_authors |
| 페이지네이션 | 9개씩 |
| 매핑 | `DbStoryRoom` → `CompletedStory` |

---

#### Step F-2. 스토리 완성 처리
**목표**: 턴 수 또는 수동으로 완성 처리

| 작업 | 상세 |
|------|------|
| 완성 조건 | PRD에 명시 없음 → 예: 턴 수 ≥ N 또는 "완성하기" 버튼 (생성자만) |
| Server Action | `completeStory(roomId)` - `story_rooms` UPDATE `is_completed=true`, `completed_at=now()` |
| UI | 스토리 상세에서 생성자에게 "스토리 완성하기" 버튼 (선택) |

---

### Phase G: 챌린지, 프로필, 기타

#### Step G-1. 챌린지 목록/상세
**목표**: `challenges` 테이블 연동

| 작업 | 상세 |
|------|------|
| challenges 페이지 | `from('challenges')` 조회 |
| challenge_stories | 챌린지별 참여 스토리 수 집계 |
| challenges/[id] | 챌린지 상세 + 참여 스토리 목록 |

**참고**: challenges 데이터는 admin이 SQL로 삽입하거나 시드 스크립트 사용

---

#### Step G-2. 인기 작가 (PopularAuthors)
**목표**: profiles + 집계 쿼리

| 작업 | 상세 |
|------|------|
| 집계 | `story_turns` author_id별 count, `turn_likes` 합계 |
| RPC 또는 뷰 | `get_popular_authors(limit)` |
| PopularAuthors | Supabase 데이터로 렌더링 |

---

#### Step G-3. 프로필 페이지
**목표**: 내 참여/좋아요 스토리, 통계

| 작업 | 상세 |
|------|------|
| 참여 스토리 | `story_turns` WHERE author_id = auth.uid() → room_id 목록 → story_rooms 조회 |
| 좋아요 스토리 | `story_likes` WHERE user_id = auth.uid() → story_rooms 조회 |
| 통계 | 턴 수, 받은 좋아요, 참여 스토리 수 |
| profiles | `display_name`, `avatar_url`, `bio`, `preferred_genres` 표시 |

---

#### Step G-4. 프로필 설정 (profile/settings)
**목표**: localStorage → Supabase profiles

| 작업 | 상세 |
|------|------|
| profiles UPDATE | `display_name`, `avatar_url`, `bio`, `preferred_genres` |
| Server Action | `updateProfile(payload)` |
| settings 페이지 | 폼 제출 시 `updateProfile` 호출 |

---

#### Step G-5. 작가 프로필 (profile/[id])
**목표**: 다른 사용자 프로필 조회

| 작업 | 상세 |
|------|------|
| 데이터 | profiles + 참여 스토리 + 통계 |
| AuthorProfilePopover | `profile/[id]` 링크, hover/클릭 시 미리보기 |

---

### Phase H: 랭킹, 에필로그 (선택/Phase 1.5)

#### Step H-1. 랭킹 페이지
**목표**: 스토리/작가 랭킹 (PRD Phase 2)

| 작업 | 상세 |
|------|------|
| 스토리 랭킹 | `story_rooms` ORDER BY like_count, 기간 필터 (선택) |
| 작가 랭킹 | 집계 쿼리 또는 RPC |

---

#### Step H-2. 에필로그
**목표**: 완성 스토리에 에필로그 작성/조회

| 작업 | 상세 |
|------|------|
| epilogues 테이블 | 이미 스키마에 존재 |
| EpilogueSection | `epilogues` WHERE room_id 조회 |
| 에필로그 작성 | Server Action `createEpilogue(roomId, content)` |

---

## 3. 의존성 및 순서 요약

```
A-1 → A-2 → A-3 (인프라)
  ↓
B-1 → B-2 (인증)
  ↓
C-1 → C-2 → C-3 → C-4 (스토리 CRUD + Lock)
  ↓
D-1, D-2 (좋아요) — C-3 완료 후
  ↓
E-1 → E-2 (AI 가이드) — C-3 완료 후
  ↓
F-1, F-2 (완성 작품)
  ↓
G-1 ~ G-5 (챌린지, 프로필)
  ↓
H-1, H-2 (랭킹, 에필로그, 선택)
```

---

## 4. 환경 변수 체크리스트

| 변수 | 용도 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트용 anon key | ✅ |
| `SUPABASE_SERVICE_ROLE` | 서버 전용 (RPC, admin) | ✅ (서버 액션) |
| `OPENAI_API_KEY` | AI 가이드 API | ✅ (Phase E) |

---

## 5. 파일 구조 (예상)

```
practice1/
├── app/
│   ├── api/
│   │   └── guide/
│   │       └── route.ts          # AI 가이드 API
│   └── ...
├── actions/
│   ├── story.ts                  # createStory, acquireLock, submitTurn
│   ├── likes.ts                  # toggleTurnLike, toggleStoryLike
│   ├── profile.ts                # updateProfile
│   └── epilogue.ts               # createEpilogue (선택)
├── components/
│   ├── auth/
│   │   └── LoginModal.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── ThemeProvider.tsx
│   └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── ...
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_rpc_functions.sql  # 신규
```

---

## 6. 구현 시 주의사항

1. **RLS**: 모든 테이블 RLS 활성화 상태 유지, 정책 검토
2. **Server Actions**: `'use server'`, 에러 시 `revalidatePath` 등으로 UI 갱신
3. **타입**: `Db*` 타입과 UI 타입 간 변환 유틸 함수 (`lib/mappers.ts` 등) 활용
4. **에러 처리**: try/catch, toast, Error Boundary
5. **Phase 1 범위**: PRD Phase 1 외 기능은 별도 단계로 분리

---

## 7. 승인 요청

위 계획을 검토하신 후 **승인**해 주시면, Step A-1부터 순차적으로 구현을 진행하겠습니다.

**승인 여부를 알려주세요.**
