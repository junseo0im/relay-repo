"use client"

import Link from "next/link"
import { PenLine, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent" />

      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-top duration-700">
            <Sparkles className="h-4 w-4 animate-pulse" />
            협업형 스토리텔링 플랫폼
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            함께 이야기를
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              완성해보세요
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto text-pretty animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            여러 작가들과 함께 한 문단씩 이어가며 세상에 하나뿐인 이야기를 만들어보세요.
            당신의 상상력이 새로운 이야기의 시작이 됩니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <Link href="/story/create" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                새 스토리 만들기
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
              onClick={() => {
                const el = document.getElementById("stories")
                const top = el?.offsetTop ?? 800
                window.scrollTo({ top, behavior: "smooth" })
              }}
            >
              <PenLine className="h-5 w-5" />
              이야기 이어쓰기
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
          {[
            { value: "1,234", label: "진행 중인 이야기" },
            { value: "5,678", label: "참여 작가" },
            { value: "23,456", label: "작성된 문단" },
            { value: "891", label: "완성된 이야기" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:scale-105 cursor-default animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

