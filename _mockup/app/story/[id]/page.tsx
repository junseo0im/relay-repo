import { Badge } from "@/components/ui/badge"
import { ParagraphCard } from "@/components/paragraph-card"
import { StoryActionBar } from "@/components/story-action-bar"
import { WritingEditor } from "@/components/writing-editor"
import { WritingGuide } from "@/components/writing-guide"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { sampleStoryDetail } from "@/lib/sample-data"

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // In production, fetch story data using the id
  const story = sampleStoryDetail

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Link>

        {/* Story Header */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary">{story.genre}</Badge>
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
            {story.title}
          </h1>
          <StoryActionBar
            storyId={id}
            likes={story.likes}
            isChallenge={story.isChallenge}
          />
        </div>

        {/* Story Content - Paragraphs */}
        <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">
            이야기 ({story.paragraphs.length}개의 턴)
          </h2>
          <div className="space-y-0">
            {story.paragraphs.map((paragraph) => (
              <ParagraphCard key={paragraph.turnNumber} {...paragraph} />
            ))}
          </div>
        </div>

        {/* Writing Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            다음 턴 작성하기
          </h2>
          
          {/* Guide and Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Writing Guide */}
            <div className="lg:col-span-1">
              <WritingGuide genre={story.genre} />
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              <WritingEditor />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
