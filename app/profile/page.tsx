import Link from "next/link"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">프로필</h1>
        <p className="text-muted-foreground mb-8">
          내가 시작한 스토리 / 참여한 스토리 탭, 통계(총 턴 수, 받은 좋아요, 완성한 스토리), 획득한 배지가
          제공됩니다.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </section>
    </div>
  )
}
