import { fetchPopularAuthors } from "@/lib/queries/author"
import { fetchBannerChallenge } from "@/lib/queries/challenge"
import { HomePageContent } from "./HomePageContent"

export default async function HomePage() {
  const [popularAuthors, activeChallenge] = await Promise.all([
    fetchPopularAuthors(),
    fetchBannerChallenge(),
  ])
  return (
    <HomePageContent
      popularAuthors={popularAuthors}
      activeChallenge={activeChallenge}
    />
  )
}
