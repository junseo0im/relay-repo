import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">각자</p>
            <p className="text-xs text-muted-foreground">
              함께 한 문단씩 이어 쓰는 협업형 스토리 플랫폼
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="/">
              홈
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/completed">
              완성 작품
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/challenges">
              챌린지
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/ranking">
              랭킹
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/profile">
              프로필
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 각자. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Phase 1 범위 내 기능만 제공됩니다.
          </p>
        </div>
      </div>
    </footer>
  )
}

