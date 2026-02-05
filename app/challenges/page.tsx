import { AwardWinnersGallery } from "@/components/posts/AwardWinnersGallery"
import { ChallengeCard } from "@/components/posts/ChallengeCard"
import { Sparkles, Trophy } from "lucide-react"
import { sampleChallenges } from "@/lib/sample-data"

export default function ChallengesPage() {
  const activeChallenges = sampleChallenges.filter((c) => c.status === "active")
  const upcomingChallenges = sampleChallenges.filter((c) => c.status === "upcoming")
  const endedChallenges = sampleChallenges.filter((c) => c.status === "ended")

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <AwardWinnersGallery />

        {activeChallenges.length > 0 && (
          <section className="mb-12 mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-xl font-semibold text-foreground">진행 중인 챌린지</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  theme={challenge.theme}
                  endDate={new Date(challenge.endDate)}
                  participants={challenge.participants}
                  stories={challenge.stories}
                  status={challenge.status}
                />
              ))}
            </div>
          </section>
        )}

        {upcomingChallenges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">예정된 챌린지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  theme={challenge.theme}
                  endDate={new Date(challenge.endDate)}
                  participants={challenge.participants}
                  stories={challenge.stories}
                  status={challenge.status}
                />
              ))}
            </div>
          </section>
        )}

        {endedChallenges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">종료된 챌린지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  theme={challenge.theme}
                  endDate={new Date(challenge.endDate)}
                  participants={challenge.participants}
                  stories={challenge.stories}
                  status={challenge.status}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
