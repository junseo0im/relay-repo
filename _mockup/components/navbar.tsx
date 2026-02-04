"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { LoginModal } from "@/components/login-modal"
import { BookOpen, Home, Trophy, Award, User, LogOut, Menu, X, BookCheck } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/completed", label: "완성 작품", icon: BookCheck },
  { href: "/challenges", label: "챌린지", icon: Trophy },
  { href: "/ranking", label: "랭킹", icon: Award, badge: "Phase 2" },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, isLoggedIn, logout, setShowLoginModal } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <LoginModal />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <BookOpen className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                StoryRelay
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
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
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive && "scale-110"
                    )} />
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
              {isLoggedIn && (
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    pathname === "/profile"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <User className="h-4 w-4" />
                  프로필
                </Link>
              )}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        프로필
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLoginModal(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    로그인
                  </Button>
                  <Button onClick={() => setShowLoginModal(true)}>
                    회원가입
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
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
              {isLoggedIn && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === "/profile"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <User className="h-5 w-5" />
                  프로필
                </Link>
              )}
              <div className="pt-3 border-t border-border/50">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowLoginModal(true)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full"
                    >
                      로그인
                    </Button>
                    <Button
                      onClick={() => {
                        setShowLoginModal(true)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full"
                    >
                      회원가입
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
