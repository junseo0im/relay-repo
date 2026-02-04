import { ChallengeCard } from "@/components/challenge-card"
import { AwardWinnersGallery } from "@/components/award-winners-gallery"
import { Trophy, Sparkles } from "lucide-react"

// Sample challenges data
const challenges = [
  {
    id: "1",
    title: "2026 새해 첫 이야기 챌린지",
    description: "새해의 희망과 다짐을 담은 이야기를 함께 써보세요. 주인공이 새로운 시작을 맞이하는 순간을 그려주세요.",
    genre: "자유",
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    participantCount: 156,
    storyCount: 23,
    status: "active" as const,
  },
  {
    id: "2",
    title: "반전의 마법사 챌린지",
    description: "예상치 못한 반전이 있는 판타지 이야기를 만들어보세요. 마법사가 등장하는 이야기에 놀라운 트위스트를 넣어주세요.",
    genre: "판타지",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participantCount: 89,
    storyCount: 12,
    status: "active" as const,
  },
  {
    id: "3",
    title: "미래 도시 탐험 챌린지",
    description: "2100년의 도시를 배경으로 한 SF 이야기를 함께 써보세요. 기술과 인간의 공존을 그려주세요.",
    genre: "SF",
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    participantCount: 0,
    storyCount: 0,
    status: "upcoming" as const,
  },
  {
    id: "4",
    title: "겨울밤 로맨스 챌린지",
    description: "추운 겨울밤, 따뜻한 사랑 이야기를 만들어보세요. 우연한 만남에서 시작되는 로맨스를 그려주세요.",
    genre: "로맨스",
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    participantCount: 234,
    storyCount: 45,
    status: "ended" as const,
  },
]

export default function ChallengesPage() {
  const activeChallenges = challenges.filter((c) => c.status === "active")
  const upcomingChallenges = challenges.filter((c) => c.status === "upcoming")
  const endedChallenges = challenges.filter((c) => c.status === "ended")

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            스토리 챌린지
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            함께 도전하고, 함께 이야기하세요
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            다양한 주제의 챌린지에 참여하여 다른 작가들과 함께 특별한 이야기를 만들어보세요.
            우수 작품에는 특별한 배지가 수여됩니다.
          </p>
        </div>

        {/* Award Winners Gallery */}
        <AwardWinnersGallery />

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <section className="mb-12 mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-xl font-semibold text-foreground">진행 중인 챌린지</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} {...challenge} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Challenges */}
        {upcomingChallenges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">예정된 챌린지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} {...challenge} />
              ))}
            </div>
          </section>
        )}

        {/* Ended Challenges */}
        {endedChallenges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">종료된 챌린지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} {...challenge} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
