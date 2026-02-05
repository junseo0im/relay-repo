import type {
  PopularAuthor,
  Story,
  StoryDetail,
  Paragraph,
  ProfileStory,
  Challenge,
  CompletedStory,
  Epilogue,
  RankingStory,
} from "@/lib/types"

export const sampleStories: Story[] = [
  {
    id: "1",
    title: "별빛 아래에서 시작된 여정",
    genre: "판타지",
    tags: ["모험", "마법", "우정"],
    likes: 234,
    turns: 15,
    preview:
      "그날 밤, 하늘에서 떨어진 것은 별이 아니었다. 소녀는 숲 속 깊은 곳에서 빛나는 무언가를 발견했다...",
    isChallenge: true,
  },
  {
    id: "2",
    title: "2087년, 서울의 마지막 날",
    genre: "SF",
    tags: ["디스토피아", "AI", "생존"],
    likes: 189,
    turns: 12,
    preview: "도시는 이미 텅 비어 있었다. 남은 것은 녹슨 드론들과 잊혀진 기억뿐...",
  },
  {
    id: "3",
    title: "우연히, 카페에서",
    genre: "로맨스",
    tags: ["일상", "첫사랑", "재회"],
    likes: 312,
    turns: 23,
    preview: "10년 만에 다시 마주친 그 사람. 커피 한 잔이 모든 것을 바꿔놓을 줄은 몰랐다...",
  },
  {
    id: "4",
    title: "13층에서 들리는 소리",
    genre: "공포",
    tags: ["미스터리", "심령", "아파트"],
    likes: 156,
    turns: 8,
    preview: "이 건물에는 13층이 없다고 했다. 하지만 매일 밤 12시가 되면...",
  },
  {
    id: "5",
    title: "할머니의 비밀 레시피",
    genre: "자유",
    tags: ["가족", "요리", "추억"],
    likes: 278,
    turns: 18,
    preview: "오래된 수첩에 적힌 레시피. 재료 목록 마지막에는 이상한 문장이 적혀 있었다...",
  },
  {
    id: "6",
    title: "용의 심장을 가진 기사",
    genre: "판타지",
    tags: ["기사", "용", "전쟁"],
    likes: 203,
    turns: 21,
    preview: "그는 용을 죽이러 갔다가, 대신 용의 심장을 얻어 돌아왔다...",
    isChallenge: true,
  },
]

export const popularAuthors: PopularAuthor[] = [
  {
    id: "1",
    name: "별지기",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=star",
    storiesCount: 12,
    totalLikes: 1523,
    totalTurns: 45,
    badge: "전설 작가",
  },
  {
    id: "2",
    name: "숲의여행자",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=forest",
    storiesCount: 8,
    totalLikes: 892,
    totalTurns: 34,
    badge: "베테랑 작가",
  },
  {
    id: "3",
    name: "달빛작가",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moon",
    storiesCount: 15,
    totalLikes: 2104,
    totalTurns: 67,
    badge: "전설 작가",
  },
  {
    id: "4",
    name: "새벽이슬",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dawn",
    storiesCount: 6,
    totalLikes: 645,
    totalTurns: 23,
    badge: "인기 작가",
  },
  {
    id: "5",
    name: "시간여행자",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=time",
    storiesCount: 10,
    totalLikes: 1234,
    totalTurns: 52,
    badge: "베테랑 작가",
  },
  {
    id: "6",
    name: "은하수탐험",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=galaxy",
    storiesCount: 7,
    totalLikes: 789,
    totalTurns: 29,
    badge: "인기 작가",
  },
]

export const sampleStoryDetail: StoryDetail = {
  id: "1",
  title: "별빛 아래에서 시작된 여정",
  genre: "판타지",
  tags: ["모험", "마법", "우정"],
  likes: 234,
  turns: 5,
  isChallenge: true,
  paragraphs: [
    {
      author: "별지기",
      authorId: "1",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=star",
      content:
        "그날 밤, 하늘에서 떨어진 것은 별이 아니었다. 소녀는 숲 속 깊은 곳에서 빛나는 무언가를 발견했다. 가까이 다가가자, 그것은 마치 살아있는 것처럼 맥박치며 빛을 내뿜고 있었다.",
      turnNumber: 1,
      createdAt: "2일 전",
      likes: 42,
    },
    {
      author: "숲의여행자",
      authorId: "2",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=forest",
      content:
        '"무엇이지?" 소녀는 조심스럽게 손을 뻗었다. 손끝이 빛에 닿는 순간, 온 몸으로 따뜻한 기운이 퍼져나갔다. 그리고 그녀의 머릿속에 낯선 목소리가 울려 퍼졌다. "드디어 찾았구나, 계승자여."',
      turnNumber: 2,
      createdAt: "2일 전",
      likes: 38,
    },
    {
      author: "달빛작가",
      authorId: "3",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moon",
      content:
        '소녀는 깜짝 놀라 뒤로 물러섰다. 하지만 빛은 그녀를 따라왔다. 마치 그녀에게 이끌리듯이. "계승자라니, 무슨 말이에요?" 소녀가 떨리는 목소리로 물었다.',
      turnNumber: 3,
      createdAt: "1일 전",
      likes: 51,
    },
    {
      author: "별지기",
      authorId: "1",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=star",
      content:
        '빛이 점점 형체를 갖추기 시작했다. 작은 정령의 모습이었다. 투명한 날개를 가진 그 존재는 소녀의 눈높이에 맞춰 떠올랐다. "천 년 전, 이 숲을 지키던 수호자가 있었어. 그리고 너는 그의 마지막 후손이야."',
      turnNumber: 4,
      createdAt: "12시간 전",
      likes: 29,
    },
    {
      author: "새벽이슬",
      authorId: "4",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dawn",
      content:
        '소녀의 심장이 빠르게 뛰기 시작했다. 할머니가 어릴 적 들려주셨던 옛 이야기가 떠올랐다. 그때는 그저 동화라고 생각했는데... "그래서 저에게 원하는 게 뭔가요?" 소녀는 용기를 내어 물었다.',
      turnNumber: 5,
      createdAt: "3시간 전",
      likes: 67,
    },
  ],
}

export const participatedStories: ProfileStory[] = [
  {
    id: "1",
    title: "별빛 아래에서 시작된 여정",
    genre: "판타지",
    likes: 234,
    turns: 15,
    myTurns: 3,
    lastActivity: "12시간 전",
  },
  {
    id: "3",
    title: "우연히, 카페에서",
    genre: "로맨스",
    likes: 312,
    turns: 23,
    myTurns: 2,
    lastActivity: "2일 전",
  },
  {
    id: "5",
    title: "할머니의 비밀 레시피",
    genre: "자유",
    likes: 278,
    turns: 18,
    myTurns: 1,
    lastActivity: "5일 전",
  },
]

export const likedStories: ProfileStory[] = [
  {
    id: "2",
    title: "2087년, 서울의 마지막 날",
    genre: "SF",
    likes: 189,
    turns: 12,
    lastActivity: "1일 전",
  },
  {
    id: "6",
    title: "용의 심장을 가진 기사",
    genre: "판타지",
    likes: 203,
    turns: 21,
    lastActivity: "3일 전",
  },
  {
    id: "4",
    title: "13층에서 들리는 소리",
    genre: "공포",
    likes: 156,
    turns: 8,
    lastActivity: "1주 전",
  },
]

export const sampleChallenges: Challenge[] = [
  {
    id: "1",
    title: "2026 새해 첫 이야기 챌린지",
    description: "새해의 희망과 다짐을 담은 이야기를 함께 써보세요.",
    theme: "봄, 만남, 시작",
    startDate: "2026-01-01",
    endDate: "2026-02-06",
    participants: 156,
    stories: 23,
    status: "active",
  },
  {
    id: "2",
    title: "반전의 마법사 챌린지",
    description: "예상치 못한 반전이 있는 판타지 이야기를 만들어보세요.",
    theme: "판타지, 반전",
    startDate: "2026-02-10",
    endDate: "2026-02-28",
    participants: 89,
    stories: 12,
    status: "active",
  },
  {
    id: "3",
    title: "미래 도시 탐험 챌린지",
    description: "2100년의 도시를 배경으로 한 SF 이야기를 함께 써보세요.",
    theme: "SF, 미래, 기술",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    participants: 0,
    stories: 0,
    status: "upcoming",
  },
  {
    id: "4",
    title: "겨울밤 로맨스 챌린지",
    description: "추운 겨울밤, 따뜻한 사랑 이야기를 만들어보세요.",
    theme: "로맨스, 겨울",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    participants: 234,
    stories: 45,
    status: "ended",
  },
  {
    id: "5",
    title: "에필로그 작성 챌린지",
    description:
      "완성된 이야기에 나만의 에필로그를 써보세요! 다른 독자들이 쓴 결말과는 다른, 당신만의 마무리를 선보여주세요.",
    theme: "에필로그, 창작",
    startDate: "2026-02-15",
    endDate: "2026-03-15",
    participants: 67,
    stories: 28,
    status: "active",
  },
  {
    id: "6",
    title: "첫 문장 챌린지",
    description:
      "한 문장으로 독자를 사로잡아보세요. 가장 매력적인 첫 문장을 쓰는 사람이 이기는 챌린지입니다.",
    theme: "첫 문장, 훅",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    participants: 0,
    stories: 0,
    status: "upcoming",
  },
  {
    id: "7",
    title: "반전 한 줄 챌린지",
    description:
      "마지막 턴에 한 줄의 반전을 넣어보세요. 독자들을 깜짝 놀라게 할 수 있을까요?",
    theme: "반전, 서스펜스",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
    participants: 189,
    stories: 52,
    status: "ended",
  },
]

export const rankingStories: RankingStory[] = [
  { id: "3", title: "우연히, 카페에서", genre: "로맨스", likes: 312, turns: 23, rank: 1 },
  { id: "5", title: "할머니의 비밀 레시피", genre: "자유", likes: 278, turns: 18, rank: 2 },
  { id: "1", title: "별빛 아래에서 시작된 여정", genre: "판타지", likes: 234, turns: 15, rank: 3 },
  { id: "6", title: "용의 심장을 가진 기사", genre: "판타지", likes: 203, turns: 21, rank: 4 },
  { id: "2", title: "2087년, 서울의 마지막 날", genre: "SF", likes: 189, turns: 12, rank: 5 },
  { id: "4", title: "13층에서 들리는 소리", genre: "공포", likes: 156, turns: 8, rank: 6 },
  { id: "7", title: "시간 여행자의 일기", genre: "SF", likes: 145, turns: 14, rank: 7 },
  { id: "8", title: "잃어버린 왕국의 열쇠", genre: "판타지", likes: 132, turns: 19, rank: 8 },
  { id: "9", title: "비 오는 날의 고백", genre: "로맨스", likes: 128, turns: 11, rank: 9 },
  { id: "10", title: "밤의 도서관", genre: "미스터리", likes: 119, turns: 16, rank: 10 },
]

export const completedStories: CompletedStory[] = [
  {
    id: "completed-1",
    title: "시간을 달리는 소녀의 마지막 여행",
    genre: "판타지",
    tags: ["시간여행", "모험", "감동"],
    totalTurns: 42,
    totalAuthors: 8,
    totalLikes: 1567,
    completedDate: "2025-02-15",
    preview: "모든 시간을 여행했던 소녀가 마침내 돌아갈 곳을 찾았다. 그곳은 바로...",
    coverImage: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=600&fit=crop",
  },
  {
    id: "completed-2",
    title: "최후의 로봇",
    genre: "SF",
    tags: ["포스트아포칼립스", "AI", "희망"],
    totalTurns: 36,
    totalAuthors: 6,
    totalLikes: 2103,
    completedDate: "2025-02-10",
    preview: "인류가 사라진 지 100년. 홀로 남은 로봇이 발견한 것은 마지막 인간의 메시지였다.",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop",
  },
  {
    id: "completed-3",
    title: "우리가 함께한 그 여름",
    genre: "로맨스",
    tags: ["청춘", "첫사랑", "성장"],
    totalTurns: 28,
    totalAuthors: 5,
    totalLikes: 1834,
    completedDate: "2025-02-05",
    preview: "그 여름, 우리는 영원할 줄 알았다. 하지만 모든 계절은 언젠가 끝나는 법이었다.",
    coverImage: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=400&h=600&fit=crop",
  },
  {
    id: "completed-4",
    title: "저주받은 도서관",
    genre: "공포",
    tags: ["미스터리", "저주", "책"],
    totalTurns: 31,
    totalAuthors: 7,
    totalLikes: 1245,
    completedDate: "2025-01-28",
    preview: "이 도서관에서는 책을 빌려가면 반드시 무언가를 대가로 지불해야 한다...",
    coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=600&fit=crop",
  },
  {
    id: "completed-5",
    title: "작은 빵집의 기적",
    genre: "자유",
    tags: ["일상", "힐링", "음식"],
    totalTurns: 25,
    totalAuthors: 9,
    totalLikes: 1678,
    completedDate: "2025-01-20",
    preview: "골목 끝 작은 빵집. 이곳의 빵을 먹으면 잊었던 소중한 기억이 되살아난다고 한다.",
    coverImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=600&fit=crop",
  },
  {
    id: "completed-6",
    title: "은하계 끝의 등대지기",
    genre: "SF",
    tags: ["우주", "고독", "희망"],
    totalTurns: 38,
    totalAuthors: 6,
    totalLikes: 1923,
    completedDate: "2025-01-15",
    preview: "우주의 끝에서 홀로 등대를 지키던 그가 마지막으로 받은 신호는...",
    coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
  },
]

/** 완성 작품 상세 (읽기 전용 + 에필로그용) */
export const completedStoryDetails: Record<string, StoryDetail> = {
  "completed-1": {
    id: "completed-1",
    title: "시간을 달리는 소녀의 마지막 여행",
    genre: "판타지",
    tags: ["시간여행", "모험", "감동"],
    likes: 1567,
    turns: 42,
    isCompleted: true,
    preview: "모든 시간을 여행했던 소녀가 마침내 돌아갈 곳을 찾았다.",
    paragraphs: [
      {
        author: "별지기",
        authorId: "1",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=star",
        content:
          "소녀는 시계탑 꼭대기에서 바람을 맞으며 눈을 감았다. 그 순간, 수많은 시간의 파편이 그녀를 감쌌다.",
        turnNumber: 1,
        createdAt: "2025-01-10",
        likes: 89,
      },
      {
        author: "숲의여행자",
        authorId: "2",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=forest",
        content:
          "과거와 미래를 넘나들며 그녀는 수많은 사람들을 만났다. 하지만 그 누구도 그녀의 고독을 채워주지 못했다.",
        turnNumber: 2,
        createdAt: "2025-01-11",
        likes: 76,
      },
      {
        author: "달빛작가",
        authorId: "3",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moon",
        content:
          "마지막 여행의 끝에서 그녀가 발견한 것은, 그토록 찾아다닌 '집'이 사실 처음 시작한 곳이었다는 것이었다.",
        turnNumber: 3,
        createdAt: "2025-01-12",
        likes: 134,
      },
    ],
  },
  "completed-2": {
    id: "completed-2",
    title: "최후의 로봇",
    genre: "SF",
    tags: ["포스트아포칼립스", "AI", "희망"],
    likes: 2103,
    turns: 36,
    isCompleted: true,
    preview: "인류가 사라진 지 100년. 홀로 남은 로봇이 발견한 것은 마지막 인간의 메시지였다.",
    paragraphs: [
      {
        author: "시간여행자",
        authorId: "5",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=time",
        content:
          "로봇 RX-7은 100년째 같은 경로를 순찰했다. 오늘도 폐허가 된 도시에는 아무도 없었다.",
        turnNumber: 1,
        createdAt: "2025-01-05",
        likes: 112,
      },
      {
        author: "은하수탐험",
        authorId: "6",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=galaxy",
        content:
          "그런데 그날, 낡은 건물 한구석에서 빛나는 태블릿을 발견했다. 화면에는 한 줄의 메시지가 적혀 있었다.",
        turnNumber: 2,
        createdAt: "2025-01-06",
        likes: 98,
      },
      {
        author: "새벽이슬",
        authorId: "4",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dawn",
        content:
          '"너에게 남긴다. 우리가 사랑했던 이 세계를, 한 번 더 꽃피워줘." 로봇의 센서에 이슬 같은 것이 맺혔다.',
        turnNumber: 3,
        createdAt: "2025-01-07",
        likes: 156,
      },
    ],
  },
}

/** 완성 작품 상세 조회 (ID에 매칭되지 않으면 기본 구조 반환) */
export function getCompletedStoryDetail(id: string): StoryDetail | null {
  if (completedStoryDetails[id]) return completedStoryDetails[id]
  const completed = completedStories.find((s) => s.id === id)
  if (!completed) return null
  return {
    id: completed.id,
    title: completed.title,
    genre: completed.genre,
    tags: completed.tags,
    likes: completed.totalLikes,
    turns: completed.totalTurns,
    isCompleted: true,
    preview: completed.preview,
    paragraphs: [
      {
        author: "공동 창작",
        content: completed.preview,
        turnNumber: 1,
        createdAt: completed.completedDate,
      },
    ],
  }
}

/** 샘플 에필로그 */
export const sampleEpilogues: Epilogue[] = [
  {
    id: "ep1",
    author: "별지기",
    authorId: "1",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=star",
    content:
      "그로부터 10년이 지났다. 소녀는 이제 시간을 여행하지 않는다. 대신 그녀는 아이들에게 '집'이 무엇인지 가르쳐준다.",
    createdAt: "2025-02-16",
    likes: 42,
  },
  {
    id: "ep2",
    author: "숲의여행자",
    authorId: "2",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=forest",
    content:
      "어쩌면 우리 모두가 시간을 여행하는 소녀일지도 모른다. 끝없이 찾아다니다가, 결국 처음 있던 곳으로 돌아오는.",
    createdAt: "2025-02-17",
    likes: 38,
  },
]

