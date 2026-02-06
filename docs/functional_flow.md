# StoryRelay (각자) Functional Flow — 구현 체크리스트

> **데이터 바인딩 중심** 구현 로드맵  
> 개발자가 바로 구현에 착수할 수 있도록 상세 기술 명세 포함

---

## 문서 인덱스 (Quick Navigation)

| 문서 | 경로 | 용도 |
|------|------|------|
| DB 스키마 설계 | `docs/DB-SCHEMA-DESIGN.md` | 테이블 구조, UI 필드 매핑 |
| 로드맵 | `roadmap.md` | Phase별 구현 계획 |
| 서비스 점검 | `docs/SERVICE-REVIEW-AND-IMPROVEMENTS.md` | 개선 아이디어 |
| 추가 아이디어 | `docs/ADDITIONAL-IDEAS.md` | Phase 2+ 기능 |
| PRD | `_mockup/docs/PRD.md` | 요구사항, 유저 플로우 |

---

## 개발 효율 팁

1. **장르 값 매핑**: FilterBar는 `free`/`fantasy`/`sf`/`romance`/`horror` 사용, DB는 `자유`/`판타지`/`SF`/`로맨스`/`공포`. `lib/constants.ts`에 `GENRE_VALUE_TO_DB` 맵 추가 권장.
2. **Toast**: `components/ui/toast.tsx` 존재. `hooks/use-toast.ts` 없음 → `_mockup/hooks/use-toast.ts` 복사 후 `layout.tsx`에 `<Toaster />` 추가.
3. **Supabase SSR**: Next.js App Router용 `@supabase/ssr` 패키지 사용 시 `createServerClient`가 cookies 자동 처리.
4. **RLS 우회**: `story_rooms` UPDATE는 `created_by = auth.uid()`만 허용. Lock/턴 제출은 **반드시 RPC(SECURITY DEFINER)** 또는 Service Role로 처리.
5. **컴포넌트 참조**: 기존 `components/posts/*` 구조 유지, props만 DB 연동에 맞게 확장.

---

## DB ↔ UI 타입 Quick Reference

| DB 테이블/컬럼 | UI 타입 | 매퍼 함수 |
|----------------|---------|-----------|
| story_rooms | Story, CompletedStory | mapRoomToStory, mapRoomToCompletedStory |
| story_turns + profiles | Paragraph | mapTurnToParagraph |
| story_rooms (like_count) | Story.likes | 직접 매핑 |
| story_turns (count) | Story.turns | 별도 count 쿼리 |
| challenges | Challenge | mapChallenge (start_at→startDate, end_at→endDate) |

---

## Phase 1: Foundation (기반 구축)

> **목표**: Supabase 인프라, 인증, DB 스키마 및 RPC 함수 구축

---

### 1.1 Supabase 클라이언트 및 환경 설정

**데이터 흐름**: `env 변수` → `createClient()` → `lib/supabase/*` 싱글톤 인스턴스

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 1.1.1 | @supabase/supabase-js 패키지 설치 | `package.json` | `pnpm add @supabase/supabase-js` | [ ] |
| 1.1.2 | @supabase/ssr 패키지 설치 (서버용) | `package.json` | `pnpm add @supabase/ssr` | [ ] |
| 1.1.3 | 브라우저용 Supabase 클라이언트 생성 | `lib/supabase/client.ts` | `createBrowserClient(url, anonKey)` | [ ] |
| 1.1.4 | 서버용 Supabase 클라이언트 생성 (cookies) | `lib/supabase/server.ts` | `createServerClient()` + `cookies()` from `@supabase/ssr` | [ ] |
| 1.1.5 | Service Role 클라이언트 (RPC용) | `lib/supabase/admin.ts` | `createClient(url, serviceRoleKey)` | [ ] |
| 1.1.6 | 환경 변수 검증 | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` | [ ] |

**Supabase SDK 메서드**: `createBrowserClient`, `createServerClient` (from @supabase/ssr), `createClient`

---

### 1.2 DB 마이그레이션 및 스키마 검증

**데이터 흐름**: `001_initial_schema.sql` → Supabase SQL Editor / `supabase db push` → PostgreSQL 테이블 생성

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 1.2.1 | Supabase Dashboard에서 001_initial_schema.sql 실행 | Supabase Dashboard > SQL Editor | 또는 `supabase db push` | [ ] |
| 1.2.2 | profiles, story_rooms, story_turns 등 테이블 생성 확인 | - | `SELECT * FROM information_schema.tables` | [ ] |
| 1.2.3 | RLS 정책 및 handle_new_user 트리거 동작 확인 | `supabase/migrations/001_initial_schema.sql` | - | [ ] |

**테이블 목록 (001_initial_schema.sql 기준)**: profiles, challenges, story_rooms, story_turns, story_likes, turn_likes, challenge_stories, challenge_winners, user_badges, epilogues

---

### 1.3 RPC 함수 및 트랜잭션 로직

**데이터 흐름**: `(room_id, user_id)` → RPC `check_and_acquire_lock` → `story_rooms` Lock 필드 UPDATE

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 1.3.1 | 002_rpc_functions.sql 마이그레이션 파일 생성 | `supabase/migrations/002_rpc_functions.sql` | PostgreSQL PL/pgSQL | [ ] |
| 1.3.2 | RPC: check_and_acquire_lock 구현 | 위 파일 | `SECURITY DEFINER`, Lock 만료 체크, UPDATE story_rooms | [ ] |
| 1.3.3 | RPC: submit_turn 구현 | 위 파일 | Lock 검증, INSERT story_turns, UPDATE story_rooms (preview, total_authors, lock 해제) | [ ] |
| 1.3.4 | RPC: toggle_turn_like 구현 | 위 파일 | turn_likes INSERT/DELETE, story_turns.like_count ±1 | [ ] |
| 1.3.5 | RPC: toggle_story_like 구현 | 위 파일 | story_likes INSERT/DELETE, story_rooms.like_count ±1 | [ ] |
| 1.3.6 | RPC는 Service Role 또는 SECURITY DEFINER로 실행 | 위 파일 | RLS 우회 필수 (story_rooms UPDATE는 created_by만 허용) | [ ] |

**Supabase SDK 메서드**: `supabase.rpc('check_and_acquire_lock', { room_id, user_id })`

---

### 1.4 인증 (Supabase Auth)

**데이터 흐름**: `auth.users` → `getSession()` / `onAuthStateChange` → AuthProvider state → UI

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 1.4.1 | AuthProvider 컴포넌트 생성 | `components/providers/AuthProvider.tsx` | Client Component, `createContext` | [x] |
| 1.4.2 | useAuth 훅 구현 | 위 파일 | `getSession()`, `onAuthStateChange` | [x] |
| 1.4.3 | login: signInWithPassword 호출 | 위 파일 | `supabase.auth.signInWithPassword({ email, password })` | [x] |
| 1.4.4 | signup: signUp 호출 (display_name meta) | 위 파일 | `supabase.auth.signUp({ email, password, options: { data: { display_name } } })` | [x] |
| 1.4.5 | logout: signOut 호출 | 위 파일 | `supabase.auth.signOut()` | [x] |
| 1.4.6 | LoginModal 컴포넌트 생성 | `components/auth/LoginModal.tsx` | Client Component, Dialog (shadcn) | [x] |
| 1.4.7 | layout.tsx에 AuthProvider 래핑 | `app/layout.tsx` | `<AuthProvider><ThemeProvider>...</ThemeProvider></AuthProvider>` | [x] |
| 1.4.8 | Header에 로그인/로그아웃 UI 연동 | `components/common/Header.tsx` | 비로그인: "로그인" 버튼 → setShowLoginModal(true) | [x] |
| 1.4.9 | 보호 라우트: /story/create, /profile, /profile/settings | 각 page.tsx | 비로그인 시 redirect('/') 또는 LoginModal | [x] |

**참조**: `_mockup/components/auth-provider.tsx`, `_mockup/components/login-modal.tsx`

**Supabase SDK 메서드**: `auth.getSession()`, `auth.onAuthStateChange()`, `auth.signInWithPassword()`, `auth.signUp()`, `auth.signOut()`

---

### 1.5 DB ↔ UI 타입 매퍼 유틸

**데이터 흐름**: `DbStoryRoom` → `mapRoomToStory()` → `Story` (UI 타입)

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 1.5.1 | lib/mappers.ts 생성 | `lib/mappers.ts` | 순수 함수, Db* → UI 타입 변환 | [x] |
| 1.5.2 | mapRoomToStory 구현 | 위 파일 | DbStoryRoom + turnCount → Story (genre DB값 그대로) | [x] |
| 1.5.3 | mapRoomToCompletedStory 구현 | 위 파일 | DbStoryRoom → CompletedStory (completed_at→completedDate) | [x] |
| 1.5.4 | mapTurnToParagraph 구현 | 위 파일 | DbStoryTurn + DbProfile → Paragraph (turn_index→turnNumber, author_id→authorId) | [x] |
| 1.5.5 | lib/constants.ts에 GENRE_VALUE_TO_DB 맵 추가 | `lib/constants.ts` | `{ free: '자유', fantasy: '판타지', sf: 'SF', romance: '로맨스', horror: '공포' }` | [x] |

---

## Phase 2: Core Logic (핵심 데이터 로직)

> **목표**: 스토리 CRUD, 목록/상세 조회, 이어쓰기 + Lock 데이터 바인딩

---

### 2.1 스토리 생성 (Create)

**데이터 흐름**: `폼 입력(title, genre, firstParagraph, tags)` → Server Action `createStory` → `story_rooms` INSERT + `story_turns` INSERT → `router.push(/story/[id])`

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 2.1.1 | createStory Server Action 생성 | `actions/story.ts` | `'use server'`, createServerClient | [x] |
| 2.1.2 | genre 값 변환 (free→자유 등) | 위 파일 | GENRE_VALUE_TO_DB[genre] 또는 직접 매핑 | [x] |
| 2.1.3 | story_rooms INSERT (title, genre, tags, created_by, preview=firstParagraph.slice(0,200)) | 위 파일 | `supabase.from('story_rooms').insert().select().single()` | [x] |
| 2.1.4 | story_turns INSERT (room_id, author_id, content, turn_index=1) | 위 파일 | `supabase.from('story_turns').insert()` | [x] |
| 2.1.5 | Zod 스키마로 입력 검증 | 위 파일 | `z.object({ title, genre, firstParagraph, tags })` | [x] |
| 2.1.6 | app/story/create/page.tsx handleSubmit 연동 | `app/story/create/page.tsx` | Client Component, createStory 호출 후 router.push | [x] |
| 2.1.7 | 에러 시 toast 표시 | 위 파일 | useToast (hooks/use-toast.ts 추가 필요) | [x] |

**Supabase SDK 메서드**: `from('story_rooms').insert()`, `from('story_turns').insert()`

---

### 2.2 스토리 목록 조회 (홈)

**데이터 흐름**: `story_rooms` (Supabase) → 필터/정렬/페이지네이션 → `Story[]` → StoryList/StoryCard 바인딩

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 2.2.1 | fetchStories 함수 생성 | `lib/queries/story.ts` | `from('story_rooms').select().eq('is_completed', false)` | [x] |
| 2.2.2 | genre 필터 (all 제외 시) | 위 | `.eq('genre', GENRE_VALUE_TO_DB[genre])` | [x] |
| 2.2.3 | search 필터 (title, preview, tags) | 위 | `.or(\`title.ilike.%${q}%,preview.ilike.%${q}%\`)` 또는 tags `contains` | [x] |
| 2.2.4 | 정렬 (latest, likes, deadline) | 위 | `.order('created_at', { ascending: false })` 등 | [x] |
| 2.2.5 | 페이지네이션 (9개) | 위 | `.range(offset, offset + 8)` | [x] |
| 2.2.6 | turn count: story_turns 집계 또는 room별 count | 위 | 별도 쿼리 또는 RPC `get_story_turn_counts` | [x] |
| 2.2.7 | app/page.tsx 데이터 페칭 | `app/page.tsx` | Server Component 권장 (초기 로드) 또는 Client useEffect | [x] |
| 2.2.8 | StoryList sampleStories 제거, props로 stories 전달 | `components/posts/StoryList.tsx` | `stories: Story[]` prop | [x] |
| 2.2.9 | FilterBar onFilterChange → fetchStories 재호출 | `app/page.tsx` | filters 변경 시 데이터 갱신 | [x] |

**FilterBar 연동**: `components/posts/FilterBar.tsx` — HomeFilters: `{ genre, search, sort }`

**Supabase SDK 메서드**: `from('story_rooms').select().eq().or().order().range()`

---

### 2.3 스토리 상세 조회

**데이터 흐름**: `story_rooms` + `story_turns` + `profiles` → JOIN/매핑 → `StoryDetail` → ParagraphCard, StoryActionBar 바인딩

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 2.3.1 | fetchStoryDetail 함수 생성 | `lib/queries/story.ts` | `from('story_rooms').select().eq('id', id).single()` | [x] |
| 2.3.2 | story_turns 조회 (room_id, order by turn_index) | 위 | `from('story_turns').select().eq('room_id', id).order('turn_index')` | [x] |
| 2.3.3 | profiles 조인 (author_id) | 위 | `from('profiles').select().in('id', authorIds)` | [x] |
| 2.3.4 | DbStoryTurn + DbProfile → Paragraph 매핑 | 위 | mapTurnToParagraph, **Paragraph에 turnId 추가** | [x] |
| 2.3.5 | app/story/[id]/page.tsx Server Component로 전환 | `app/story/[id]/page.tsx` | async, fetchStoryDetail(id), notFound() | [x] |
| 2.3.6 | sampleStoryDetail, getCompletedStoryDetail 제거 | 위 | DB 데이터만 사용 | [x] |
| 2.3.7 | ParagraphCard에 turnId, isLiked 전달 | `components/posts/ParagraphCard.tsx` | turnId (lib/types Paragraph 확장), isLiked | [x] |
| 2.3.8 | lib/types.ts Paragraph에 turnId? 추가 | `lib/types.ts` | `turnId?: string` | [x] |

**Supabase SDK 메서드**: `from('story_rooms').select().eq().single()`, `from('story_turns').select().eq().order()`

---

### 2.4 이어쓰기 + Lock 시스템

**데이터 흐름**: `acquireLock(roomId)` → RPC `check_and_acquire_lock` → Lock 성공 시 WritingEditor 활성화 → `submitTurn(roomId, content)` → RPC `submit_turn` → story_turns INSERT, story_rooms UPDATE

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 2.4.1 | acquireLock Server Action 생성 | `actions/story.ts` | `supabase.rpc('check_and_acquire_lock', { room_id, user_id })` (admin client 권장) | [x] |
| 2.4.2 | submitTurn Server Action 생성 | 위 | `supabase.rpc('submit_turn', { room_id, user_id, content })` | [x] |
| 2.4.3 | WritingEditor에 roomId prop 추가 | `components/posts/WritingEditor.tsx` | Client Component | [x] |
| 2.4.4 | "이어쓰기 시작" 클릭 시 acquireLock 호출 | 위 | 비로그인: setShowLoginModal / 로그인: acquireLock | [x] |
| 2.4.5 | Lock 성공 시 에디터 활성화, 5분 타이머 | 위 | isWriting=true, timeLeft=300 | [x] |
| 2.4.6 | Lock 실패 시 "다른 사용자가 작성 중" 메시지 | 위 | lockHolder, lockExpireAt 표시 | [x] |
| 2.4.7 | "문단 제출" 클릭 시 submitTurn 호출 | 위 | submitTurn(roomId, content) | [x] |
| 2.4.8 | 제출 후 revalidatePath('/story/[id]') | `actions/story.ts` | `revalidatePath(\`/story/${roomId}\`)` | [x] |
| 2.4.9 | story/[id] 페이지에서 roomId를 WritingEditor에 전달 | `app/story/[id]/page.tsx` | `<WritingEditor roomId={id} />` | [x] |

**Supabase SDK 메서드**: `supabase.rpc('check_and_acquire_lock')`, `supabase.rpc('submit_turn')`

---

## Phase 3: Interaction & Feedback (상호작용 및 피드백)

> **목표**: 좋아요, AI 가이드, 완성 작품, 프로필, 챌린지 등 사용자 상호작용 데이터 바인딩

---

### 3.1 턴 좋아요 (ParagraphCard)

**데이터 흐름**: `turn_likes` (현재 사용자) → isLiked 초기값 → 클릭 시 `toggleTurnLike` → RPC `toggle_turn_like` → like_count 갱신 → UI 반영

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.1.1 | toggleTurnLike Server Action 생성 | `actions/likes.ts` | `supabase.rpc('toggle_turn_like', { turn_id, user_id })` | [x] |
| 3.1.2 | fetchTurnLikeStatus (현재 사용자 좋아요 여부) | `lib/queries/likes.ts` | `from('turn_likes').select().eq('turn_id', id).eq('user_id', uid).maybeSingle()` | [x] |
| 3.1.3 | ParagraphCard turnId, isLiked, onLikeToggle props | `components/posts/ParagraphCard.tsx` | Client Component | [x] |
| 3.1.4 | 스토리 상세에서 각 턴별 isLiked 조회 후 전달 | `app/story/[id]/page.tsx` | Server: turn_likes bulk 조회 (user_id, turn_ids) | [x] |
| 3.1.5 | 낙관적 업데이트 (클릭 시 즉시 UI 반영) | ParagraphCard | setLikeCount, setIsLiked → toggleTurnLike → 실패 시 롤백 | [x] |

**Supabase SDK 메서드**: `rpc('toggle_turn_like')`, `from('turn_likes').select()`

---

### 3.2 스토리 좋아요 (StoryActionBar)

**데이터 흐름**: `story_likes` (현재 사용자) → isLiked → 클릭 시 `toggleStoryLike` → RPC → like_count 갱신 → UI

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.2.1 | toggleStoryLike Server Action 생성 | `actions/likes.ts` | `supabase.rpc('toggle_story_like', { room_id, user_id })` | [x] |
| 3.2.2 | StoryActionBar roomId(또는 storyId), isLiked, likeCount props | `components/posts/StoryActionBar.tsx` | 기존 storyId → roomId로 통일 권장 | [x] |
| 3.2.3 | 스토리 상세에서 isLiked 조회 후 전달 | `app/story/[id]/page.tsx` | story_likes WHERE room_id, user_id | [x] |
| 3.2.4 | 좋아요 버튼 클릭 시 toggleStoryLike 호출 | StoryActionBar | onLikeClick → toggleStoryLike | [x] |

**Supabase SDK 메서드**: `rpc('toggle_story_like')`

---

### 3.3 AI 작성 가이드

**데이터 흐름**: `story_turns` (최근 N턴) → API Route `/api/guide` → **Google Gemini** → 톤/팁/문장 제안 → WritingGuide UI 바인딩

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.3.1 | @google/generative-ai 패키지 설치 | `package.json` | `pnpm add @google/generative-ai` | [x] |
| 3.3.2 | GOOGLE_GENERATIVE 환경 변수 추가 | `.env.local` | `GOOGLE_GENERATIVE=...` (Gemini API Key) | [x] |
| 3.3.3 | POST /api/guide Route Handler 생성 | `app/api/guide/route.ts` | Next.js Route Handler | [x] |
| 3.3.4 | Request body에서 roomId 파싱 | 위 | `const { roomId } = await request.json()` | [x] |
| 3.3.5 | Supabase에서 최근 5~10턴 조회 | 위 | `from('story_turns').select().eq('room_id', roomId).order('turn_index', { ascending: false }).limit(10)` | [x] |
| 3.3.6 | Gemini generateContent 호출 | 위 | `model: 'gemini-2.0-flash'`, systemInstruction + prompt | [x] |
| 3.3.7 | 응답 파싱 (tone, pace, suggestions) | 위 | JSON 또는 구조화된 텍스트 | [x] |
| 3.3.8 | WritingGuide roomId prop, fetch 가이드 | `components/posts/WritingGuide.tsx` | Client, `fetch('/api/guide', { method: 'POST', body: JSON.stringify({ roomId }) })` | [x] |
| 3.3.9 | 로딩/에러 상태 UI | 위 | Skeleton, Retry 버튼 | [x] |

**참고**: StoryActionBar의 "AI 줄거리 요약"은 별도 API `/api/summary` 또는 GROQ 활용 가능 (Phase 2)

**API Route**: `POST /api/guide`  
**Supabase SDK 메서드**: `from('story_turns').select().eq().order().limit()`

#### AI API 키 활용 전략

| 환경 변수 | 용도 | 사용 위치 | 특징 |
|-----------|------|-----------|------|
| `GOOGLE_GENERATIVE` | Gemini API Key | `/api/guide` (작성 가이드), `/api/cover` (표지 생성) | 톤/팁/문장 제안, 이미지 생성(Nano Banana), 무료 티어 |
| `GROQ_API_KEY` | GROQ API Key | `/api/summary` (줄거리 요약, Phase 2) | Llama 모델, 초고속 응답, 실시간 요약 |

---

### 3.4 완성 작품 갤러리

**데이터 흐름**: `story_rooms` WHERE `is_completed=true` → 필터/정렬/페이지네이션 → `CompletedStory[]` → completed 페이지 카드 그리드

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.4.1 | fetchCompletedStories 함수 생성 | `lib/queries/story.ts` | `from('story_rooms').select().eq('is_completed', true)` | [x] |
| 3.4.2 | genre, search, sort 필터 적용 | 위 | .eq, .or, .order | [x] |
| 3.4.3 | 페이지네이션 (9개) | 위 | .range() | [x] |
| 3.4.4 | app/completed/page.tsx sample 데이터 제거 | `app/completed/page.tsx` | Client Component, /api/completed fetch | [x] |
| 3.4.5 | mapRoomToCompletedStory 매핑 | 위 | DbStoryRoom → CompletedStory | [x] |
| 3.4.6 | completeStory Server Action (생성자만) | `actions/story.ts` | `from('story_rooms').update({ is_completed: true, completed_at: now() }).eq('id', roomId).eq('created_by', uid)` | [x] |
| 3.4.7 | 스토리 상세 "완성하기" 버튼 (생성자만) | `app/story/[id]/page.tsx` 또는 StoryActionBar | created_by === auth.uid() 시 표시 | [x] |

**Supabase SDK 메서드**: `from('story_rooms').select().eq('is_completed', true).order().range()`

---

### 3.5 프로필 페이지

**데이터 흐름**: `auth.uid()` → `profiles` + `story_turns`(참여) + `story_likes`(좋아요) → ProfileStory[] → ProfileStoryList 바인딩

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.5.1 | fetchMyProfile 함수 | `lib/queries/profile.ts` | `from('profiles').select().eq('id', uid).single()` | [x] |
| 3.5.2 | 참여 스토리: story_turns WHERE author_id | 위 | room_id 목록 → story_rooms 조회, myTurns count | [x] |
| 3.5.3 | 좋아요 스토리: story_likes WHERE user_id | 위 | room_id 목록 → story_rooms 조회 | [x] |
| 3.5.4 | 통계: 턴 수, 받은 좋아요, 참여 스토리 수 | 위 | 집계 쿼리 또는 RPC | [x] |
| 3.5.5 | app/profile/page.tsx DB 연동 | `app/profile/page.tsx` | Client, useEffect 또는 Server Component | [x] |
| 3.5.6 | localStorage profile-settings 제거 | 위 | profiles 테이블만 사용 | [x] |

**Supabase SDK 메서드**: `from('profiles').select()`, `from('story_turns').select()`, `from('story_likes').select()`

---

### 3.6 프로필 설정 (profile/settings)

**데이터 흐름**: `폼(displayName, avatarUrl, bio, preferredGenres)` → `updateProfile` Server Action → `profiles` UPDATE → UI 반영

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.6.1 | updateProfile Server Action 생성 | `actions/profile.ts` | `from('profiles').update({ display_name, avatar_url, bio, preferred_genres }).eq('id', auth.uid())` | [ ] |
| 3.6.2 | app/profile/settings/page.tsx 폼 연동 | `app/profile/settings/page.tsx` | Client, handleSubmit → updateProfile | [ ] |
| 3.6.3 | Zod 검증 (displayName 20자, bio 150자 등) | actions/profile.ts | z.object() | [ ] |

**Supabase SDK 메서드**: `from('profiles').update()`

---

### 3.7 챌린지 목록/상세

**데이터 흐름**: `challenges` → Challenge[] → ChallengeBanner, ChallengeCard / `challenge_stories` → 챌린지별 스토리 목록

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.7.1 | fetchChallenges 함수 | `lib/queries/challenge.ts` | `from('challenges').select().order('start_at')` | [x] |
| 3.7.2 | challenge_stories로 참여 스토리 수 집계 | 위 | count by challenge_id | [x] |
| 3.7.3 | mapChallenge (start_at→startDate, end_at→endDate) | `lib/mappers.ts` | DbChallenge → Challenge | [x] |
| 3.7.4 | app/challenges/page.tsx sampleChallenges 제거 | `app/challenges/page.tsx` | DB 데이터로 교체 | [x] |
| 3.7.5 | app/challenges/[id]/page.tsx 참여 스토리 목록 | `app/challenges/[id]/page.tsx` | challenge_stories + story_rooms 조인 | [x] |
| 3.7.6 | challenges 시드 데이터 (선택) | SQL 또는 시드 스크립트 | admin이 수동 INSERT | [ ] |

**Supabase SDK 메서드**: `from('challenges').select()`, `from('challenge_stories').select()`

---

### 3.8 인기 작가 (PopularAuthors)

**데이터 흐름**: `profiles` + `story_turns` count + `turn_likes` sum → PopularAuthor[] → PopularAuthors 컴포넌트

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.8.1 | getPopularAuthors RPC 또는 쿼리 | `lib/queries/author.ts` 또는 RPC | story_turns, turn_likes 집계 | [x] |
| 3.8.2 | user_badges 조인 (배지) | 위 | from('user_badges').select() | [x] |
| 3.8.3 | app/page.tsx PopularAuthors 데이터 전달 | `app/page.tsx` | fetchPopularAuthors() | [x] |
| 3.8.4 | PopularAuthors popularAuthors sample 제거 | `components/posts/PopularAuthors.tsx` | props로 authors 전달 | [x] |

---

### 3.9 작가 프로필 (profile/[id])

**데이터 흐름**: `profiles` + 참여 스토리 + 통계 → profile/[id] 페이지

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.9.1 | fetchAuthorProfile(id) 함수 | `lib/queries/profile.ts` | profiles + story_turns 집계 | [ ] |
| 3.9.2 | app/profile/[id]/page.tsx DB 연동 | `app/profile/[id]/page.tsx` | fetchAuthorProfile(params.id) | [ ] |
| 3.9.3 | AuthorProfilePopover /profile/[id] 링크 | `components/posts/AuthorProfilePopover.tsx` | Link href={`/profile/${authorId}`} | [ ] |

---

### 3.10 랭킹 페이지 (Phase 1.5)

**데이터 흐름**: `story_rooms` ORDER BY like_count → RankingStory[] → ranking 페이지

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.10.1 | fetchRankingStories 함수 | `lib/queries/ranking.ts` | `from('story_rooms').select().order('like_count', { ascending: false }).limit(10)` | [x] |
| 3.10.2 | app/ranking/page.tsx sample 제거 | `app/ranking/page.tsx` | DB 데이터로 교체 | [x] |

---

### 3.11 에필로그 (Phase 1.5)

**데이터 흐름**: `epilogues` WHERE room_id → Epilogue[] → EpilogueSection / `createEpilogue` → INSERT

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.11.1 | fetchEpilogues(roomId) 함수 | `lib/queries/epilogue.ts` | `from('epilogues').select().eq('room_id', roomId)` | [x] |
| 3.11.2 | createEpilogue Server Action | `actions/epilogue.ts` | `from('epilogues').insert({ room_id, author_id, content })` | [x] |
| 3.11.3 | EpilogueSection DB 연동 | `components/posts/EpilogueSection.tsx` | epilogues props, 작성 폼 → createEpilogue | [x] |
| 3.11.4 | epilogues + profiles 조인 (author 표시) | lib/queries/epilogue.ts | author_id → profiles display_name, avatar_url | [x] |

---

### 3.12 AI 표지 생성 (완성 작품)

**데이터 흐름**: 완성 스토리 → "표지 생성" 버튼 → `POST /api/cover` → Gemini (Nano Banana) 이미지 생성 → Supabase Storage 업로드 → `story_rooms.cover_image` UPDATE → UI 반영

| # | 태스크 | 파일 경로 | 기술 스택 | 체크 |
|---|--------|-----------|-----------|------|
| 3.12.1 | story_rooms.cover_image 컬럼 확인 | `001_initial_schema.sql` | 이미 존재 시 스킵, 없으면 마이그레이션 추가 | [ ] |
| 3.12.2 | Supabase Storage 버킷 생성 | Supabase Dashboard | `covers` 버킷, 공개 읽기 정책 | [ ] |
| 3.12.3 | POST /api/cover Route Handler 생성 | `app/api/cover/route.ts` | Next.js Route Handler | [ ] |
| 3.12.4 | Request body에서 roomId 파싱 | 위 | `const { roomId } = await request.json()` | [ ] |
| 3.12.5 | 완성 스토리 검증 (is_completed, created_by) | 위 | fetchStoryDetail 또는 직접 쿼리 | [ ] |
| 3.12.6 | Gemini generateContent (responseModalities: IMAGE) | 위 | `model: 'gemini-2.5-flash-image'`, 제목+장르+줄거리 → 프롬프트 | [ ] |
| 3.12.7 | 이미지 Base64 → Supabase Storage 업로드 | 위 | `storage.from('covers').upload(path, buffer)` | [ ] |
| 3.12.8 | story_rooms.cover_image UPDATE | 위 | Public URL 저장 | [ ] |
| 3.12.9 | 완성 작품 상세/갤러리에 "표지 생성" 버튼 | `app/story/[id]/page.tsx` 또는 EpilogueSection | 생성자만 표시, is_completed 시 | [ ] |
| 3.12.10 | 로딩/에러/재생성 UI | 위 | Skeleton, Retry, cover_image 표시 | [ ] |

**참고**: DB 스키마에 `cover_image` 컬럼 이미 존재 (DB-SCHEMA-DESIGN.md)

**API Route**: `POST /api/cover`  
**AI 모델**: Gemini 2.5 Flash Image (Nano Banana) — `GOOGLE_GENERATIVE` 키 사용

---

## 4. 구현 우선순위 및 순서

### 우선순위 정의
- 🔴 **Critical**: 서비스 핵심, 반드시 선행
- 🟡 **High**: 주요 기능, Core Logic 완료 후
- 🟢 **Normal**: 부가 기능, Interaction 단계

### 구현 순서 (데이터 바인딩 의존성 기준)

| 순서 | Phase | 항목 | 우선순위 | 의존 |
|------|-------|------|----------|------|
| 1 | 1.1 | Supabase 클라이언트 | 🔴 | - |
| 2 | 1.2 | DB 마이그레이션 | 🔴 | 1 |
| 3 | 1.3 | RPC 함수 | 🔴 | 2 |
| 4 | 1.4 | 인증 (AuthProvider, LoginModal) | 🔴 | 1 |
| 5 | 1.5 | 타입 매퍼 + constants | 🔴 | 1 |
| 6 | 2.1 | 스토리 생성 | 🔴 | 3, 4 |
| 7 | 2.2 | 스토리 목록 조회 | 🔴 | 5 |
| 8 | 2.3 | 스토리 상세 조회 | 🔴 | 5 |
| 9 | 2.4 | 이어쓰기 + Lock | 🔴 | 3, 4, 8 |
| 10 | 3.1 | 턴 좋아요 | 🟡 | 8 |
| 11 | 3.2 | 스토리 좋아요 | 🟡 | 8 |
| 12 | 3.3 | AI 작성 가이드 | 🟡 | 8 |
| 13 | 3.4 | 완성 작품 갤러리 | 🟡 | 5 |
| 14 | 3.5 | 프로필 페이지 | 🟡 | 4 |
| 15 | 3.6 | 프로필 설정 | 🟡 | 4, 14 |
| 16 | 3.7 | 챌린지 | 🟢 | 2 |
| 17 | 3.8 | 인기 작가 | 🟢 | 2 |
| 18 | 3.9 | 작가 프로필 | 🟢 | 14 |
| 19 | 3.10 | 랭킹 | 🟢 | 2 |
| 20 | 3.11 | 에필로그 | 🟢 | 13 |
| 21 | 3.12 | AI 표지 생성 | 🟢 | 13, 3.4 |

---

## 5. 기술 스택 요약

| 구분 | 기술 | 용도 |
|------|------|------|
| **Framework** | Next.js 16 App Router | Server/Client Component, Server Actions |
| **DB** | Supabase (PostgreSQL) | story_rooms, story_turns, profiles 등 |
| **Auth** | Supabase Auth | signInWithPassword, signUp, getSession |
| **SDK** | @supabase/supabase-js, @supabase/ssr | createBrowserClient, createServerClient, from().select().insert().update().rpc() |
| **API** | Next.js Route Handler | POST /api/guide, POST /api/cover, POST /api/summary (GROQ) |
| **AI** | Google Gemini 2.0 Flash | 작성 가이드 톤 분석, 문장 제안 |
| **AI** | Google Gemini 2.5 Flash Image (Nano Banana) | 완성 작품 AI 표지 생성 |
| **AI** | GROQ (Llama) | AI 줄거리 요약 (고속 응답) |
| **Validation** | Zod | Server Action 입력 검증 |
| **UI** | shadcn/ui, Tailwind v4 | Dialog, Button, Card 등 |
| **Toast** | @radix-ui/react-toast + useToast | 에러/성공 피드백 |

### 주요 파일 경로 요약

```
lib/supabase/client.ts      # 브라우저 클라이언트
lib/supabase/server.ts      # 서버 클라이언트 (cookies)
lib/supabase/admin.ts       # Service Role (RPC)
lib/mappers.ts              # Db* → UI 타입 변환
lib/constants.ts            # GENRE_VALUE_TO_DB 등
lib/queries/story.ts        # fetchStories, fetchStoryDetail, fetchCompletedStories
lib/queries/profile.ts      # fetchMyProfile, fetchAuthorProfile
lib/queries/challenge.ts    # fetchChallenges
lib/queries/likes.ts        # fetchTurnLikeStatus
lib/queries/author.ts       # fetchPopularAuthors
lib/queries/epilogue.ts     # fetchEpilogues
actions/story.ts            # createStory, acquireLock, submitTurn, completeStory
actions/likes.ts            # toggleTurnLike, toggleStoryLike
actions/profile.ts          # updateProfile
actions/epilogue.ts         # createEpilogue
app/api/guide/route.ts      # AI 가이드 API
components/providers/AuthProvider.tsx
components/auth/LoginModal.tsx
hooks/use-toast.ts          # _mockup에서 복사 후 추가
supabase/migrations/002_rpc_functions.sql
```

---

## 6. 체크리스트 진행 요약

- **Phase 1 (Foundation)**: 1.1 ~ 1.5 → 인프라, 인증, 매퍼, constants
- **Phase 2 (Core Logic)**: 2.1 ~ 2.4 → 스토리 CRUD, Lock
- **Phase 3 (Interaction)**: 3.1 ~ 3.12 → 좋아요, AI, 완성작품, AI 표지, 프로필, 챌린지 등

구현 시 위 순서대로 진행하면 데이터 바인딩 의존성을 만족하며 단계별로 검증 가능합니다.
