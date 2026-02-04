import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">스토리 상세</h1>
        <p className="text-sm text-muted-foreground mb-2">스토리 ID: {id}</p>
        <p className="text-muted-foreground mb-8">
          타임라인 형태의 턴 표시, 각 턴별 좋아요, 작가 프로필 팝오버, 이어쓰기 에디터 + AI 작성 가이드가
          제공됩니다.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="outline">홈으로 돌아가기</Button>
          </Link>
          <Link href="/story/create">
            <Button>새 스토리 만들기</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
