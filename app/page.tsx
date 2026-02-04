"use client"

import { useState } from "react"

import { ChallengeBanner } from "@/components/posts/ChallengeBanner"
import { FilterBar, type HomeFilters } from "@/components/posts/FilterBar"
import { HeroSection } from "@/components/posts/HeroSection"
import { PopularAuthors } from "@/components/posts/PopularAuthors"
import { StoryList } from "@/components/posts/StoryList"

export default function HomePage() {
  const [filters, setFilters] = useState<HomeFilters>({
    genre: "all",
    search: "",
    sort: "latest",
  })

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ChallengeBanner />
      <PopularAuthors />
      <div id="stories">
        <FilterBar onFilterChange={setFilters} />
        <StoryList filters={filters} />
      </div>
    </div>
  )
}
