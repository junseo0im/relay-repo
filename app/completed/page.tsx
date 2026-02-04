import Link from "next/link"
import { BookCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CompletedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <BookCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">완성 작품</h1>
        <p className="text-muted-foreground mb-8">
          완성된 스토리 전용 갤러리입니다. 장르/인기순/최신순 필터와 페이지네이션이 제공됩니다.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}
