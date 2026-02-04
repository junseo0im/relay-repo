import Link from "next/link"
import { Award } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function RankingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">랭킹</h1>
        <Badge variant="secondary" className="mb-4">
          Phase 2
        </Badge>
        <p className="text-muted-foreground mb-8">
          인기 스토리 랭킹, 인기 작가 랭킹, 장르별/기간별 필터가 제공됩니다.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}
