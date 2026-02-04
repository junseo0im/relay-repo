import Link from "next/link"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">작가 프로필</h1>
        <p className="text-sm text-muted-foreground mb-2">ID: {id}</p>
        <p className="text-muted-foreground mb-8">
          작가 통계 및 배지, 시작한 스토리 / 참여한 스토리 목록이 제공됩니다.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="outline">홈으로 돌아가기</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost">프로필 목록</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
