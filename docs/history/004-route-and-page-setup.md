# 004 - Route and Page Setup

## 날짜
2025-02-04

## 변경 내용

### 1. PRD/FLOW 기반 경로 검증
- `_mockup/docs/PRD.md` "5. Page Structure & Navigation" 메뉴 구조와 현재 코드의 `href` 경로를 비교
- `_mockup/docs/FLOW.md`는 비어 있어 PRD만 참조
- **결과**: 모든 링크 경로가 PRD 정의와 일치함. 수정 필요 경로 없음

### 2. 생성된 라우트 페이지 (404 해소)

| 경로 | 파일 | 설명 |
|------|------|------|
| `/completed` | `app/completed/page.tsx` | 완성 작품 갤러리 (플레이스홀더) |
| `/challenges` | `app/challenges/page.tsx` | 챌린지 (플레이스홀더) |
| `/ranking` | `app/ranking/page.tsx` | 랭킹 Phase 2 (플레이스홀더) |
| `/profile` | `app/profile/page.tsx` | 프로필 (플레이스홀더) |
| `/profile/[id]` | `app/profile/[id]/page.tsx` | 작가 프로필 상세 (플레이스홀더) |
| `/story/create` | `app/story/create/page.tsx` | 새 스토리 만들기 (플레이스홀더) |
| `/story/[id]` | `app/story/[id]/page.tsx` | 스토리 상세 (플레이스홀더) |

각 페이지는 다음을 포함:
- 아이콘 + 제목 + 설명
- "홈으로 돌아가기" 버튼
- (해당 시) 추가 네비게이션 링크

### 3. 링크 출처 및 검증

| 컴포넌트 | 링크 | 상태 |
|----------|------|------|
| Header | `/`, `/completed`, `/challenges`, `/ranking`, `/profile` | ✅ |
| Footer | `/`, `/completed`, `/challenges`, `/ranking`, `/profile` | ✅ |
| HeroSection | `/story/create` | ✅ |
| ChallengeBanner | `/challenges` | ✅ |
| PopularAuthors | `/profile/${author.id}` | ✅ |
| StoryCard | `/story/${id}` | ✅ |

### 4. PRD에 정의되지 않은 경로 (미구현)
- `/challenges/[id]` - _mockup의 challenge-card에서 사용. 현재 루트 프로젝트 미사용
- `/story/[id]/full` - _mockup의 story-action-bar에서 사용. 현재 루트 프로젝트 미사용

## 변경 이유
- 메인 페이지 버튼/링크 클릭 시 404 방지
- PRD 정의 페이지 구조에 맞춘 라우트 완성
- 향후 기능 구현 시 페이지 스캐폴딩 기반 제공

## 관련 이슈/에러
- 없음
