"use client"

import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isLoggedIn, isLoading, setShowLoginModal } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="p-6 rounded-full bg-muted/50">
          <LogIn className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">로그인이 필요합니다</h2>
        <p className="text-muted-foreground text-center max-w-md">
          이 페이지를 이용하려면 로그인해주세요.
        </p>
        <Button onClick={() => setShowLoginModal(true)} className="gap-2">
          <LogIn className="h-4 w-4" />
          로그인
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
