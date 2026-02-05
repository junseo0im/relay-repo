/**
 * FilterBar UI 값 ↔ DB 장르 값 매핑
 * FilterBar: free | fantasy | sf | romance | horror
 * DB: 자유 | 판타지 | SF | 로맨스 | 공포
 */
export const GENRE_VALUE_TO_DB: Record<string, string> = {
  free: "자유",
  fantasy: "판타지",
  sf: "SF",
  romance: "로맨스",
  horror: "공포",
} as const

/** DB 장르 → FilterBar UI 값 (역매핑) */
export const GENRE_DB_TO_VALUE: Record<string, string> = {
  자유: "free",
  판타지: "fantasy",
  SF: "sf",
  로맨스: "romance",
  공포: "horror",
} as const
