import Link from "next/link"
import { PenLine } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function StoryCreatePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <PenLine className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">새 스토리 만들기</h1>
        <p className="text-muted-foreground mb-8">
          제목, 장르, 첫 문단, 태그를 입력하고 실시간 유효성 검사를 받을 수 있습니다.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}
