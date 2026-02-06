"use client"

import { useState } from "react"

import { ChallengeBanner } from "@/components/posts/ChallengeBanner"
import { FilterBar, type HomeFilters } from "@/components/posts/FilterBar"
import { HeroSection } from "@/components/posts/HeroSection"
import { PopularAuthors } from "@/components/posts/PopularAuthors"
import { StoryList } from "@/components/posts/StoryList"
import type { ActiveChallenge } from "@/lib/queries/challenge"
import type { PopularAuthor } from "@/lib/types"

interface HomePageContentProps {
  popularAuthors: PopularAuthor[]
  activeChallenge: ActiveChallenge | null
}

export function HomePageContent({
  popularAuthors,
  activeChallenge,
}: HomePageContentProps) {
  const [filters, setFilters] = useState<HomeFilters>({
    genre: "all",
    search: "",
    sort: "latest",
  })

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ChallengeBanner challenge={activeChallenge} />
      <PopularAuthors authors={popularAuthors} />
      <div id="stories">
        <FilterBar onFilterChange={setFilters} />
        <StoryList filters={filters} />
      </div>
    </div>
  )
}
