import Link from "next/link"
import { Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ChallengesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">챌린지</h1>
        <p className="text-muted-foreground mb-8">
          진행 중/예정/종료된 챌린지, 수상작 갤러리(명예의 전당), 참여 뱃지 시스템이 제공됩니다.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}
