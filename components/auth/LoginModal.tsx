"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/AuthProvider"
import { BookOpen, Loader2 } from "lucide-react"

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, signup } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setError(null)
    setShowLoginModal(open)
  }

  return (
    <Dialog open={showLoginModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            {isLogin ? "다시 만나서 반가워요!" : "각자에 오신 것을 환영합니다"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {isLogin
              ? "계정에 로그인하여 이야기를 이어가세요"
              : "계정을 만들고 이야기에 참여하세요"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                이름
              </Label>
              <Input
                id="name"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="bg-input/50"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-input/50"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isLogin ? "로그인" : "회원가입"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
