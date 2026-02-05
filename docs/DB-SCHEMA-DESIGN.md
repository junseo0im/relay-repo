# StoryRelay Supabase DB 스키마 설계안

> **분석 기준**: PRD + `app/` 페이지 + `components/posts/` 카드·리스트 컴포넌트  
> **우선순위**: UI 컴포넌트가 요구하는 데이터 형식 우선

---

## 1. 코드 분석 결과: UI에서 사용 중인 데이터 필드

### 1.1 Story (진행 중 스토리) - StoryCard, StoryList
| 필드 | 용도 | 출처 |
|------|------|------|
| id | 링크, 키 | - |
| title | 제목 표시 | - |
| genre | 장르 칩 (자유/판타지/SF/로맨스/공포) | - |
| tags | 태그 배열 (#태그) | - |
| likes | 좋아요 수 | - |
| turns | 턴 개수 | - |
| preview | 미리보기 텍스트 (line-clamp-2) | **코드 전용** |
| isChallenge | 챌린지 참여 여부 (정렬·배지) | **코드 전용** |

### 1.2 CompletedStory (완성 작품) - completed/page
| 필드 | 용도 | 출처 |
|------|------|------|
| id, title, genre, tags | 기본 정보 | - |
| totalTurns | 턴 수 | - |
| totalAuthors | 참여 작가 수 | - |
| totalLikes | 총 좋아요 | - |
| completedDate | 완성일 | - |
| preview | 미리보기 | **코드 전용** |
| coverImage | 커버 이미지 URL | PRD |

### 1.3 Paragraph (턴) - ParagraphCard
| 필드 | 용도 | 출처 |
|------|------|------|
| author | 작성자 이름 | users JOIN |
| authorId | 프로필 링크 | - |
| authorAvatar | 아바타 이미지 | profiles |
| content | 문단 내용 | - |
| turnNumber | 턴 순서 | turn_index |
| createdAt | 작성일 | - |
| likes | 턴별 좋아요 | turn_likes |

### 1.4 PopularAuthor / 프로필 - PopularAuthors, AuthorProfilePopover, profile/[id]
| 필드 | 용도 | 출처 |
|------|------|------|
| id, name | 기본 정보 | auth.users + profiles |
| avatar | 아바타 URL | **코드 전용** |
| storiesCount | 참여 스토리 수 | 집계 |
| totalLikes | 받은 좋아요 합계 | 집계 |
| totalTurns | 작성 턴 수 | 집계 |
| badge | 배지 (전설/베테랑/인기 작가) | user_badges |

### 1.5 ProfileStory - ProfileStoryList
| 필드 | 용도 | 출처 |
|------|------|------|
| id, title, genre, likes, turns | 스토리 요약 | story_rooms |
| myTurns | 내가 쓴 턴 수 (참여 시) | 집계 |
| lastActivity | 마지막 활동 | **코드 전용** |

### 1.6 Challenge - ChallengeCard, challenges/[id]
| 필드 | 용도 | 출처 |
|------|------|------|
| id, title, description, theme | 기본 정보 | - |
| startDate, endDate | 기간 | start_at, end_at |
| participants | 참여자 수 | - |
| stories | 참여 스토리 수 | **코드 전용** (PRD는 winner_story_id만) |
| status | active/upcoming/ended | - |

### 1.7 Award Winners - AwardWinnersGallery
| 필드 | 용도 | 출처 |
|------|------|------|
| id, title, author | 스토리·작가 | - |
| challengeName | 챌린지명 | challenges |
| rank | 1/2/3위 | **코드 전용** |
| likes, views | 통계 | - |
| excerpt | 발췌문 | preview |

### 1.8 Epilogue - EpilogueSection
| 필드 | 용도 | 출처 |
|------|------|------|
| id, author, authorId, authorAvatar | 작성자 | - |
| content | 에필로그 내용 | - |
| createdAt | 작성일 | - |
| likes | 좋아요 | **코드 전용** |

### 1.9 프로필 설정 - profile/settings
| 필드 | 용도 | 출처 |
|------|------|------|
| displayName | 표시 이름 | **코드 전용** |
| avatarUrl | 프로필 이미지 URL | **코드 전용** |
| bio | 한 줄 소개 | **코드 전용** |
| preferredGenres | 선호 장르 배열 | **코드 전용** |

---

## 2. 테이블 설계 요약

| 테이블 | 설명 |
|--------|------|
| `profiles` | Supabase Auth 확장 (display_name, avatar_url, bio, preferred_genres) |
| `story_rooms` | 스토리 방 (PRD + preview, challenge_id) |
| `story_turns` | 턴 (문단) |
| `story_likes` | 스토리 단위 좋아요 |
| `turn_likes` | 턴 단위 좋아요 |
| `challenges` | 챌린지 |
| `challenge_stories` | 챌린지-스토리 연결 (participants, stories 집계용) |
| `challenge_winners` | 챌린지 수상작 (rank, story_id) |
| `user_badges` | 사용자 배지 |
| `epilogues` | 완성 스토리 에필로그 |

---

## 3. 실행 완료 내역

- [x] **SQL 스크립트**: `supabase/migrations/001_initial_schema.sql`
  - Supabase SQL Editor에 복사하여 실행하거나, `supabase db push` 사용
- [x] **types 업데이트**: `lib/types.ts` - DB 스키마 타입(Db*) + UI 타입 추가

---

## 4. 상세 테이블 스키마

### 4.1 profiles (Supabase Auth 확장)
```sql
-- auth.users와 1:1, id = auth.uid()
id uuid PK (auth.users.id)
display_name text
avatar_url text
bio text
preferred_genres text[]
created_at timestamptz
updated_at timestamptz
```

### 4.2 story_rooms
```sql
id uuid PK
title text NOT NULL
genre text DEFAULT '자유'  -- 자유|판타지|SF|로맨스|공포
tags text[] DEFAULT '{}'
created_by uuid FK → auth.users
preview text              -- 첫 문단 미리보기 (UI용)
cover_image text          -- 커버 이미지 URL
challenge_id uuid FK → challenges  -- nullable, 챌린지 참여 시
current_lock_user_id uuid
lock_expire_at timestamptz
like_count int DEFAULT 0
is_completed boolean DEFAULT false
completed_at timestamptz
total_authors int DEFAULT 1
created_at timestamptz
updated_at timestamptz
```

### 4.3 story_turns
```sql
id uuid PK
room_id uuid FK → story_rooms
author_id uuid FK → auth.users
content text NOT NULL
turn_index int NOT NULL
like_count int DEFAULT 0
created_at timestamptz
```

### 4.4 story_likes
```sql
id uuid PK
room_id uuid FK → story_rooms
user_id uuid FK → auth.users
created_at timestamptz
UNIQUE(room_id, user_id)
```

### 4.5 turn_likes
```sql
id uuid PK
turn_id uuid FK → story_turns
user_id uuid FK → auth.users
created_at timestamptz
UNIQUE(turn_id, user_id)
```

### 4.6 challenges
```sql
id uuid PK
title text NOT NULL
description text
theme text
start_at timestamptz
end_at timestamptz
status text  -- active|upcoming|ended
participants int DEFAULT 0
created_at timestamptz
updated_at timestamptz
```

### 4.7 challenge_stories (챌린지-스토리 연결)
```sql
id uuid PK
challenge_id uuid FK → challenges
room_id uuid FK → story_rooms
created_at timestamptz
UNIQUE(challenge_id, room_id)
```

### 4.8 challenge_winners (수상작)
```sql
id uuid PK
challenge_id uuid FK → challenges
room_id uuid FK → story_rooms
rank int
created_at timestamptz
UNIQUE(challenge_id, rank)
```

### 4.9 user_badges
```sql
id uuid PK
user_id uuid FK → auth.users
badge_type text  -- 전설 작가|베테랑 작가|인기 작가
earned_at timestamptz
```

### 4.10 epilogues (완성 스토리 에필로그)
```sql
id uuid PK
room_id uuid FK → story_rooms
author_id uuid FK → auth.users
content text NOT NULL
like_count int DEFAULT 0
created_at timestamptz
```

---

## 5. RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 본인 | 본인 | 본인 | - |
| story_rooms | 공개 | 인증 | 생성자/수정 | 생성자 |
| story_turns | 공개 | 인증 | 작성자 | 작성자 |
| story_likes | 공개 | 인증 | - | 본인 |
| turn_likes | 공개 | 인증 | - | 본인 |
| challenges | 공개 | admin | admin | admin |
| challenge_stories | 공개 | 인증 | - | - |
| challenge_winners | 공개 | admin | admin | admin |
| user_badges | 공개 | admin | - | admin |
| epilogues | 공개 | 인증 | 작성자 | 작성자 |

---

## 6. 승인 요청

위 설계안을 검토하신 후 **승인**해 주시면,  
1) Supabase SQL Editor에 바로 적용 가능한 `CREATE TABLE` + RLS 쿼리 작성  
2) `lib/types.ts` DB 스키마 기반 타입 업데이트  

를 진행하겠습니다.

**승인 여부를 알려주세요.**
