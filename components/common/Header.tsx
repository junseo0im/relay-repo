"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { BookOpen, Home, Trophy, Award, User, Menu, X, BookCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

// PRD.md "메뉴 구조" 기반
const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/completed", label: "완성 작품", icon: BookCheck },
  { href: "/challenges", label: "챌린지", icon: Trophy },
  { href: "/ranking", label: "랭킹", icon: Award, badge: "Phase 2" },
  { href: "/profile", label: "프로필", icon: User },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeHref = useMemo(() => {
    // exact match first; fall back to prefix match for nested routes
    const exact = navItems.find((i) => i.href === pathname)
    if (exact) return exact.href
    const prefix = navItems
      .filter((i) => i.href !== "/")
      .find((i) => pathname?.startsWith(i.href))
    return prefix?.href ?? "/"
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <BookOpen className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
              각자
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive && "scale-110"
                    )}
                  />
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <nav className="relative px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

