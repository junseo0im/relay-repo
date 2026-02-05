# 각자(StoryRelay) 서비스 점검 및 개선 제안

**작성일**: 2026-02-04  
**목적**: 본격적인 기능 구현 및 DB 모델링 전, 전반적인 서비스 형태 점검 및 개선 아이디어 정리

---

## 1. 현재 서비스 현황 요약

### 1.1 페이지 구조

| 경로 | 상태 | 설명 |
|------|------|------|
| `/` | ✅ 완료 | 홈 - 히어로, 챌린지 배너, 인기 작가, 스토리 목록(필터/페이지네이션) |
| `/completed` | ✅ 완료 | 완성 작품 갤러리 - 장르/검색/정렬, 카드 그리드, 페이지네이션 |
| `/challenges` | ✅ 완료 | 챌린지 - 수상작 갤러리, 진행 중/예정/종료 섹션 |
| `/challenges/[id]` | ✅ 신규 | 챌린지 상세 - 참여 스토리 목록, 기간/참여자 정보 |
| `/ranking` | ✅ 완료 | 랭킹 - 스토리 랭킹(주간/월간/전체), 작가 랭킹 플레이스홀더 |
| `/profile` | ✅ 완료 | 내 프로필 - 참여/좋아요 스토리, 통계 |
| `/profile/[id]` | ✅ 완료 | 작가 프로필 - 통계, 참여/좋아요 스토리 |
| `/story/[id]` | ✅ 완료 | 스토리 상세 - 문단 타임라인, 이어쓰기 에디터, AI 가이드 |
| `/story/create` | ✅ 완료 | 새 스토리 만들기 - 제목, 장르, 첫 문단, 태그 |

### 1.2 컴포넌트 구조

```
components/
├── common/          # 공통 레이아웃
│   ├── Header.tsx   # GNB (홈, 완성작품, 챌린지, 랭킹, 프로필)
│   └── Footer.tsx
├── posts/           # 도메인별 컴포넌트
│   ├── HeroSection, ChallengeBanner, FilterBar, StoryList, StoryCard
│   ├── PopularAuthors, AuthorProfilePopover
│   ├── ParagraphCard, StoryActionBar, WritingEditor, WritingGuide
│   ├── ChallengeCard, AwardWinnersGallery
│   └── ProfileStoryList
└── ui/              # shadcn/ui 기반 공통 UI
```

### 1.3 데이터 현황

- **모든 데이터**: `lib/sample-data.ts` 하드코딩
- **타입**: `lib/types.ts`에 정의
- **API/DB 연동**: 없음 (클라이언트 샘플 데이터만 사용)

---

## 2. DB 모델링 전 체크리스트

### 2.1 PRD ERD와의 정합성

| PRD 엔티티 | 현재 타입 | 비고 |
|------------|-----------|------|
| story_rooms | Story, StoryDetail | ✅ genre, tags, likes, turns 매핑 가능 |
| story_turns | Paragraph | ✅ turn_index, content, author 매핑 |
| story_likes | - | ❌ 스토리 단위 좋아요 타입 없음 |
| turn_likes | Paragraph.likes | ⚠️ 턴별 좋아요는 있으나 user별 추적 불가 |
| challenges | Challenge | ✅ theme, participants, stories, status |
| users | - | ❌ 인증 미구현 |
| user_badges | PopularAuthor.badge | ⚠️ 문자열만, 별도 테이블 필요 |

### 2.2 누락/보완 필요 사항

1. **챌린지-스토리 연관**
   - PRD: `story_rooms ||--o{ challenges : participates`
   - 현재: `Story.isChallenge` boolean만 존재
   - 제안: `story_rooms.challenge_id` (nullable FK) 또는 `challenge_stories` 조인 테이블

2. **스토리-작가 매핑**
   - 현재: Paragraph에 author 문자열만
   - 제안: `author_id` (user FK) 필수, `author`는 조인/캐시용

3. **랭킹 데이터 소스**
   - 스토리 랭킹: `story_rooms.like_count` + 기간 필터
   - 작가 랭킹: `users` + 집계(총 좋아요, 참여 스토리 수)

4. **완성 작품 판별**
   - PRD: `story_rooms.is_completed`, `completed_at`
   - 현재: `CompletedStory` 타입만, 별도 목록

---

## 3. 개선 및 제안 아이디어

### 3.1 UX/UI 개선

| 영역 | 현재 | 제안 |
|------|------|------|
| **스토리 상세** | 모든 문단 한 번에 로드 | 무한 스크롤 또는 "더 보기"로 턴 수 제한 (초기 10턴 등) |
| **이어쓰기** | 5분 타이머, 500자 제한 | 타이머 만료 시 자동 저장 초안, 재접속 시 복구 |
| **검색** | 클라이언트 필터만 | 서버 검색 + debounce, 태그 자동완성 |
| **빈 상태** | 단순 메시지 | 일러스트/CTA 버튼으로 유도 (예: "첫 스토리 만들어보기") |
| **로딩** | 거의 없음 | Suspense, skeleton UI, 버튼 로딩 스피너 |
| **에러** | 미처리 | Error Boundary, 토스트 알림 |
| **모바일** | 반응형 있음 | 하단 네비게이션 바 추가 검토 (손 닿기 쉬운 영역) |

### 3.2 기능 확장 제안

| 기능 | Phase | 설명 |
|------|-------|------|
| **합본 보기** | 1 | 스토리 상세에서 "합본 보기" → 턴 텍스트 이어붙여 읽기 전용 모드 |
| **챌린지 알림** | 2 | 관심 챌린지 등록, 시작/종료 알림 |
| **장르별 랭킹** | 2 | 랭킹 탭에 장르 필터 추가 |
| **스토리 북마크** | 2 | 읽는 중인 스토리 저장, 이어 읽기 |
| **다크 모드** | 1 | theme-provider 활용, 시스템/수동 전환 |
| **OG 이미지** | 1 | 스토리/작가 공유 시 동적 OG 이미지 생성 |
| **접근성** | 1 | aria-label, 포커스 관리, 스크린 리더 테스트 |

### 3.3 아키텍처/성능

| 항목 | 제안 |
|------|------|
| **데이터 페칭** | Server Components로 초기 데이터, Client는 인터랙션만 |
| **캐싱** | React Query/SWR 또는 Next.js fetch cache로 목록/상세 캐시 |
| **이미지** | next/image + Unsplash/placeholder, 커버 이미지 최적화 |
| **번들** | 동적 import로 모달/에디터 등 무거운 컴포넌트 분리 |
| **SEO** | metadata, JSON-LD (Article, Person) |

### 3.4 DB/API 설계 보완

| 항목 | 제안 |
|------|------|
| **challenge_stories** | `challenge_id`, `room_id` 조인 테이블로 다대다 지원 |
| **story_rooms** | `challenge_id` nullable 추가 시 단일 챌린지만 지원 가능 |
| **인덱스** | `story_rooms(is_completed, like_count)`, `story_turns(room_id, turn_index)` |
| **RPC** | `check_and_acquire_lock`, `toggle_turn_like` 등 트랜잭션 로직 |
| **실시간** | Supabase Realtime으로 새 턴 알림 (Phase 2) |

### 3.5 보안/검증

| 항목 | 제안 |
|------|------|
| **입력 검증** | Zod 등으로 스토리/턴 생성 시 서버 검증 |
| **Rate limit** | 이어쓰기, 좋아요 등 액션별 제한 |
| **XSS** | 턴 content는 sanitize 또는 CSP |
| **RLS** | Supabase Row Level Security로 테이블별 접근 제어 |

---

## 4. 구현 우선순위 제안

### Phase 1 (핵심 기능)

1. **Supabase 설정** - 프로젝트 생성, 스키마 마이그레이션
2. **인증** - Supabase Auth, 로그인/회원가입 모달
3. **스토리 CRUD** - 생성, 목록 조회, 상세 조회 (DB 연동)
4. **이어쓰기 + Lock** - RPC 기반 Lock, 턴 저장
5. **좋아요** - 스토리/턴 좋아요 토글, 카운트 갱신
6. **AI 가이드** - `/api/guide` 라우트, OpenAI 연동
7. **완성 작품** - `is_completed` 필터, 갤러리 연동

### Phase 1.5 (UX 강화)

8. **로딩/에러 UI** - Suspense, Error Boundary, 토스트
9. **합본 보기** - 스토리 상세 내 읽기 전용 모드
10. **다크 모드** - theme-provider 적용

### Phase 2

11. **랭킹 API** - 주간/월간 집계, 장르 필터
12. **작가 랭킹** - 집계 쿼리, 랭킹 페이지 연동
13. **챌린지 연동** - challenge_stories, 챌린지별 스토리 목록
14. **알림** - 턴 대기열, 좋아요 알림 (선택)

---

## 5. 정리

현재 UI/페이지 구조는 **목업 수준에서 상당히 완성**되어 있으며, 챌린지·랭킹 페이지도 보강되었다.  
다음 단계로 **Supabase 스키마 설계 → 인증 → 스토리/턴 CRUD** 순으로 진행하면, 샘플 데이터를 실제 DB로 전환하면서 점진적으로 기능을 확장할 수 있다.

위 개선 아이디어는 우선순위에 따라 선택적으로 적용하면 된다.
