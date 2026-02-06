# StoryRelay (각자) 서비스 평가 및 개선 제안

> **작성일**: 2026-02-05  
> **목적**: 전체 서비스 점검 후 강점·약점 분석 및 우선순위별 개선 제안

---

## 1. 전체 평가 요약

| 영역 | 점수 | 상태 |
|------|------|------|
| 핵심 기능 (CRUD, Lock, 좋아요) | ⭐⭐⭐⭐⭐ | DB 연동 완료 |
| 인증·보안 | ⭐⭐⭐⭐ | RLS, Zod 검증, 보호 라우트 |
| AI 연동 | ⭐⭐⭐⭐ | 가이드, 줄거리, 표지 |
| UX/로딩·에러 | ⭐⭐ | Suspense, Error Boundary 미흡 |
| 접근성·SEO | ⭐⭐ | 기본 metadata만 |
| 운영·관리 | ⭐⭐ | 관리자 UI 없음 |

---

## 2. 강점 (잘 되어 있는 부분)

### 2.1 데이터 연동
- 스토리 CRUD, 이어쓰기 + Lock, 턴/스토리/에필로그 좋아요
- 챌린지 배너·목록·상세·수상작 갤러리
- 프로필, 인기 작가, 랭킹 (스토리/작가)
- 완성 작품 갤러리, 에필로그

### 2.2 기술 스택
- Server Components + Server Actions
- Zod 입력 검증 (createStory 등)
- RLS, Service Role 분리
- Toast, 다크 모드, Empty State

### 2.3 AI
- AI 작성 가이드 (톤 분석, 문장 제안)
- AI 줄거리 요약 (GROQ)
- AI 표지 생성 (fallback 포함)

---

## 3. 개선 필요 영역 (우선순위별)

### 🔴 높음 (즉시 개선 권장)

#### 3.1 로딩·에러 UX
| 현재 | 제안 |
|------|------|
| 데이터 로딩 시 빈 화면 또는 깜빡임 | `loading.tsx` + Skeleton UI |
| API/DB 에러 시 처리 부족 | Error Boundary, `error.tsx` |
| 버튼 클릭 후 피드백 | 일부만 `isPending` 스피너 |

**구체 작업**
- `app/story/[id]/loading.tsx`, `app/challenges/loading.tsx` 등 추가
- `app/error.tsx` (전역), `app/story/[id]/error.tsx` (페이지별)
- Skeleton 컴포넌트 (`components/ui/skeleton.tsx`) 활용

#### 3.2 챌린지 참여 플로우
| 현재 | 제안 |
|------|------|
| 스토리 생성 시 챌린지 선택 불가 | "이 챌린지에 참여" 옵션 추가 |
| challenge_stories 자동 등록 없음 | challenge_id 선택 시 INSERT |

**구체 작업**
- `/story/create`에 진행 중 챌린지 선택 드롭다운
- `createStory`에 `challengeId?: string` 파라미터
- story_rooms.challenge_id + challenge_stories INSERT

#### 3.3 SEO·공유
| 현재 | 제안 |
|------|------|
| layout metadata만 | 페이지별 `generateMetadata` |
| OG 이미지 없음 | `/api/og` 동적 생성 |

**구체 작업**
- `app/story/[id]/page.tsx`: `generateMetadata` (제목, 설명, OG)
- `app/profile/[id]/page.tsx`: 작가명, 소개
- `app/api/og/route.tsx`: @vercel/og 또는 satori

---

### 🟡 중간 (1~2주 내)

#### 3.4 Supabase 세션 갱신
| 현재 | 제안 |
|------|------|
| middleware.ts 없음 | `updateSession`으로 쿠키 갱신 |

**구체 작업**
- `middleware.ts` 생성, `createServerClient`로 `refreshSession`
- 장시간 방문 시 로그인 유지

#### 3.5 스토리 상세 성능
| 현재 | 제안 |
|------|------|
| 턴 전체 한 번에 로드 | 초기 15~20턴만, "더 보기" 페이징 |

**구체 작업**
- `fetchStoryDetail`에 `limit`, `offset` 옵션
- Client에서 "더 보기" 클릭 시 추가 턴 fetch
- 또는 `FullStoryView`에서 가상화

#### 3.6 Rate Limit
| 현재 | 제안 |
|------|------|
| 이어쓰기, 좋아요, API 무제한 | 액션별 제한 |

**구체 작업**
- Vercel KV / Upstash Redis
- `api/summary`, `api/guide`, `api/cover` 등 호출 제한
- Server Action `toggleStoryLike` 등 클릭 스팸 방지

#### 3.7 접근성
| 현재 | 제안 |
|------|------|
| aria-label 일부만 | 버튼, 링크, 모달에 보강 |
| 포커스 트랩 | LoginModal, WritingEditor |

**구체 작업**
- `aria-label`, `aria-describedby` 추가
- 모달 오픈 시 `focus trap`, ESC 닫기
- 스크린 리더 테스트 (NVDA, VoiceOver)

---

### 🟢 낮음 (Phase 2+)

#### 3.8 관리자 기능
- 챌린지 생성/수정 UI
- challenge_winners 등록 UI
- user_badges 수여

#### 3.9 모바일 UX
- 하단 네비게이션 바 (손 닿기 쉬운 영역)
- 스와이프 제스처

#### 3.10 실시간
- Supabase Realtime: 새 턴 작성 시 알림
- "다른 작가가 이어쓰고 있어요" 표시

#### 3.11 스토리 북마크
- 읽는 중 저장, 이어 읽기
- `story_bookmarks` 테이블

---

## 4. 빠른 체크리스트 (Quick Wins)

| # | 작업 | 예상 시간 | 파일 |
|---|------|----------|------|
| 1 | `app/error.tsx` 전역 에러 UI | 30분 | `app/error.tsx` |
| 2 | `app/loading.tsx` 루트 로딩 | 15분 | `app/loading.tsx` |
| 3 | 스토리 상세 `generateMetadata` | 20분 | `app/story/[id]/page.tsx` |
| 4 | 챌린지 선택 옵션 (스토리 생성) | 1시간 | `app/story/create`, `actions/story.ts` |
| 5 | `middleware.ts` 세션 갱신 | 30분 | `middleware.ts` |

---

## 5. 아키텍처 다이어그램 (현재)

```
[Client]
  ├── AuthProvider (세션)
  ├── ThemeProvider (다크 모드)
  └── 페이지별 Server Component
        └── fetch*() → Supabase (createClient / createAdminClient)

[Server]
  ├── Server Actions (createStory, toggleLike, submitTurn, ...)
  ├── API Routes (/api/guide, /api/summary, /api/cover, ...)
  └── RPC (check_and_acquire_lock, submit_turn, toggle_*_like)

[DB]
  └── Supabase (PostgreSQL + Auth + Storage)
```

---

## 6. 참고 문서

- `docs/functional_flow.md` - 구현 체크리스트
- `docs/ENHANCEMENT-IDEAS.md` - 기능 확장 아이디어
- `docs/SERVICE-REVIEW-AND-IMPROVEMENTS.md` - 기존 개선 제안
