# StoryRelay 고도화 아이디어

> **작성일**: 2026-02-05  
> **목적**: functional_flow.md 및 전체 서비스 검토 후, 개선·기능 추가·UI 아이디어 종합

---

## 1. 현재 상태 요약

### 1.1 완료된 기능 (DB 연동)
- 스토리 CRUD, 이어쓰기 + Lock, 턴/스토리 좋아요
- 프로필, 프로필 설정, 작가 프로필 (profile/[id])
- 챌린지 목록/상세, 인기 작가, 랭킹
- 에필로그, AI 작성 가이드, AI 표지 생성 (fallback 포함)
- 완성 작품 갤러리

### 1.2 아직 샘플/하드코딩인 부분
| 컴포넌트 | 현재 | 개선 포인트 |
|----------|------|--------------|
| **ChallengeBanner** | "2026 새해 첫 이야기 챌린지" 하드코딩, 타이머 가짜 | 진행 중 챌린지 1개 DB 연동, end_at 기준 실시간 카운트다운 |
| **AwardWinnersGallery** | winnerStories 하드코딩 3개 | challenge_winners + story_rooms 조인 |
| **AI 줄거리 요약** | placeholder 텍스트 고정 | `/api/summary` (Gemini/GROQ) 연동 |
| **AuthorProfilePopover** | popularAuthors 샘플에서 authorId로 검색 | fetchAuthorStats(authorId) API 또는 props로 전달 |

### 1.3 미구현/플레이스홀더
- **작가 랭킹**: "준비 중" → fetchPopularAuthors 기반 랭킹 표시
- **에필로그 좋아요**: epilogues.like_count 컬럼 있으나 UI 토글 미연동
- **챌린지 참여**: 스토리 생성 시 challenge_id 연결, challenge_stories INSERT

---

## 2. 즉시 개선 (Quick Wins)

### 2.1 ChallengeBanner DB 연동
- `fetchChallenges()`에서 status=active 1개 조회
- 제목, 설명, end_at → 실시간 카운트다운
- 없으면 배너 숨기거나 "다음 챌린지 예정" 메시지

### 2.2 AwardWinnersGallery DB 연동
- `fetchChallengeWinners()`: challenge_winners + story_rooms + profiles
- 종료된 챌린지별 1~3위 수상작 표시
- challenge_winners에 데이터 없으면 "수상작이 아직 없습니다" 빈 상태

### 2.3 AI 줄거리 요약 연동
- `POST /api/summary` Route Handler 추가
- story_turns content → Gemini/GROQ로 요약 생성
- StoryActionBar "AI 줄거리 요약" 클릭 시 fetch → 표시

### 2.4 AuthorProfilePopover DB 연동
- `GET /api/author/[id]/stats` 또는 Server Component에서 fetchAuthorStats
- authorId로 storiesCount, totalLikes, totalTurns, badge 조회
- ParagraphCard/EpilogueSection에서 authorId 있을 때 popover에 전달

### 2.5 functional_flow.md 체크리스트 동기화
- 실제 구현 상태에 맞게 [x] 체크 업데이트
- 문서와 코드 불일치 해소

---

## 3. 기능 확장

### 3.1 스토리 북마크 (읽는 중 저장)
- `story_bookmarks` 테이블: user_id, room_id, last_turn_index, created_at
- "이어 읽기" 버튼 → 마지막 읽은 턴으로 스크롤
- 프로필에 "읽는 중" 탭 추가

### 3.2 챌린지 참여 플로우
- 스토리 생성 시 "챌린지에 참여" 옵션 (진행 중 챌린지 선택)
- story_rooms.challenge_id + challenge_stories INSERT
- 챌린지 상세에서 "이 챌린지로 스토리 만들기" CTA

### 3.3 작가 랭킹 탭 구현
- fetchPopularAuthors() 기반 정렬 (totalLikes, totalTurns 등)
- 랭킹 페이지 "작가 랭킹" 탭에 실제 데이터 표시

### 3.4 에필로그 좋아요
- toggleEpilogueLike RPC 또는 Server Action
- epilogues.like_count 갱신
- EpilogueSection 각 카드에 좋아요 버튼

### 3.5 스토리 공유
- "공유하기" 버튼 → 링크 복사, SNS 공유
- OG 이미지: `/api/og?type=story&id=xxx` (동적 생성)

---

## 4. UI/UX 개선

### 4.1 읽기 경험
- **읽기 모드**: 폰트 크기, 줄간격, 배경색(라이트/다크/세피아) 조절
- **무한 스크롤**: 턴이 많은 스토리에서 초기 10~20턴만 로드, "더 보기"로 추가
- **목차/턴 점프**: 턴 번호 클릭 시 해당 턴으로 스크롤

### 4.2 빈 상태(Empty State) 강화
- 스토리 없음, 챌린지 없음 등 → 일러스트 + CTA ("첫 스토리 만들어보기")
- 인기 작가 0명 → "아직 참여한 작가가 없어요" + 스토리 만들기 유도

### 4.3 로딩/에러
- Suspense + Skeleton (스토리 목록, 프로필 등)
- Error Boundary로 예기치 않은 에러 처리
- API 실패 시 Retry 버튼, 토스트 알림

### 4.4 모바일 UX
- 하단 네비게이션 바 (홈, 완성작품, 챌린지, 랭킹, 프로필)
- 스와이프 제스처 (스토리 카드 넘기기 등)
- 턴 작성 시 키보드 올라올 때 레이아웃 조정

### 4.5 접근성
- aria-label, role 보강
- 포커스 관리 (모달, 에디터)
- 스크린 리더 테스트

---

## 5. AI 활용 확장

### 5.1 AI 줄거리 요약 (실제 연동)
- 이미 제안됨 → `/api/summary` 구현

### 5.2 문장/다음 턴 추천
- "다음 문장 추천" 버튼 → 최근 N턴 기반 3가지 후보 제시
- 사용자가 선택하거나 수정하여 사용

### 5.3 톤/분위기 시각화
- 스토리 톤(밝음/어두움/긴장 등) AI 분석 → 차트/태그로 표시
- "이 스토리는 70% 긴장, 30% 감동" 같은 인사이트

### 5.4 캐릭터 시트 자동 추출
- 등장인물 이름, 관계, 성격 요약
- 긴 스토리에서 독자/작가 참고용

---

## 6. 게임화/동기부여

### 6.1 업적 시스템
- `user_achievements` 테이블 또는 user_badges 확장
- "첫 스토리 완성", "10턴 작성", "첫 좋아요 받기" 등
- 프로필에 배지/업적 갤러리

### 6.2 연속 작성 스트릭
- N일 연속 턴 작성 시 스트릭 표시
- "7일 연속 참여!" 배지

### 6.3 주간 미션
- "로맨스 장르 스토리에 1턴 참여"
- 완료 시 보상(배지, 포인트 등)

### 6.4 리더보드 강화
- 챌린지별, 장르별 세부 랭킹
- "이번 주 신인 작가" 등

---

## 7. 아키텍처/성능

### 7.1 데이터 페칭 전략
- Server Components로 초기 데이터, Client는 인터랙션만
- React Query/SWR로 클라이언트 캐시 (필터 변경 시)

### 7.2 이미지 최적화
- next/image로 커버 이미지
- Supabase Storage + 이미지 리사이징 (선택)

### 7.3 번들 최적화
- 모달, 에디터 등 동적 import
- Route-based code splitting

### 7.4 실시간 (Phase 2)
- Supabase Realtime: 새 턴 작성 시 알림
- "다른 작가가 이어쓰고 있어요" 실시간 표시

---

## 8. 보안/운영

### 8.1 Rate Limit
- 이어쓰기, 좋아요, API 호출별 제한
- Vercel Edge / Upstash Redis 등

### 8.2 입력 검증
- 턴 content 길이/금지어
- XSS 방지 (sanitize 또는 CSP)

### 8.3 관리자 기능
- 챌린지 생성/수정 (challenges INSERT는 service_role)
- user_badges 수여
- challenge_winners 등록

---

## 9. 우선순위 제안

### Phase 1 (1~2주)
1. ChallengeBanner DB 연동
2. AwardWinnersGallery DB 연동
3. AI 줄거리 요약 API 연동
4. AuthorProfilePopover DB 연동
5. functional_flow.md 체크리스트 업데이트

### Phase 2 (2~4주)
6. 스토리 북마크
7. 챌린지 참여 플로우
8. 작가 랭킹 탭
9. 에필로그 좋아요
10. 읽기 모드 (폰트/테마)

### Phase 3 (1~2개월)
11. 업적/스트릭 시스템
12. AI 문장 추천
13. 스토리 공유 + OG 이미지
14. 실시간 알림

---

## 10. 참고 문서

- `docs/functional_flow.md` - 구현 체크리스트
- `docs/SERVICE-REVIEW-AND-IMPROVEMENTS.md` - 기존 개선 제안
- `docs/ADDITIONAL-IDEAS.md` - Phase 2+ 아이디어
