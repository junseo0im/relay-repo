# 006. 챌린지·랭킹 페이지 개선

**날짜**: 2026-02-04  
**목적**: 챌린지·랭킹 페이지 구현 보강 및 챌린지 상세 페이지 추가

## 작업 내용

### 1. ChallengeCard 수정

- `Challenge` 타입과 정합성 맞춤: `theme`, `participants`, `stories` 사용
- `genre` → `theme` (displayTheme)로 표시
- `participantCount`/`storyCount` → `participants`/`stories`로 통일
- 종료된 챌린지 버튼 비활성화 제거 (결과 보기 가능하도록)

### 2. 챌린지 상세 페이지 (`/challenges/[id]`)

- 신규 페이지 추가
- 챌린지 정보: 제목, 설명, 기간, 참여자/스토리 수, 상태 배지
- 참여 스토리 목록 (해당 챌린지 스토리 카드 그리드)
- 예정 챌린지: 시작일 안내 + 관심 등록 안내
- 종료 챌린지: 수상작 갤러리 링크
- AwardWinnersGallery에 `id="award-winners"` 추가 (앵커 링크용)

### 3. 랭킹 페이지 개선 (`/ranking`)

- 스토리 랭킹: 10개 목록, 1~3위 아이콘(왕관/메달), 좋아요/턴 수 표시
- 기간 탭: 주간/월간/전체 (UI만, 데이터는 동일)
- 작가 랭킹 탭: Phase 2 플레이스홀더 + 스토리 랭킹으로 전환 버튼
- Phase 2 안내: 장르별/작가별 랭킹 등 추가 예정 안내

### 4. 샘플 데이터

- `lib/sample-data.ts`: `RankingStory` 타입 및 `rankingStories` 배열 추가
- 스토리 10개 (id, title, genre, likes, turns, rank)

### 5. 헤더

- 랭킹 메뉴에서 "Phase 2" 배지 제거 (랭킹 UI 구현 완료)

## 참고 파일

- `app/challenges/[id]/page.tsx` (신규)
- `app/ranking/page.tsx` (전면 수정)
- `components/posts/ChallengeCard.tsx` (props 수정)
- `components/posts/AwardWinnersGallery.tsx` (id 추가)
- `lib/sample-data.ts` (rankingStories 추가)
