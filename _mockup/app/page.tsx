"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { ChallengeBanner } from "@/components/challenge-banner"
import { FilterBar } from "@/components/filter-bar"
import { StoryList } from "@/components/story-list"
import { PopularAuthors } from "@/components/popular-authors"

export default function HomePage() {
  const [filters, setFilters] = useState({
    genre: "all",
    search: "",
    sort: "latest"
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
