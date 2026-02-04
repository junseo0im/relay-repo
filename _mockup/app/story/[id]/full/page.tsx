import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Heart } from "lucide-react"
import Link from "next/link"

// Sample story data - in production this would come from an API
const sampleStory = {
  id: "1",
  title: "별빛 아래에서 시작된 여정",
  genre: "판타지",
  tags: ["모험", "마법", "우정"],
  likes: 234,
  content: `그날 밤, 하늘에서 떨어진 것은 별이 아니었다. 소녀는 숲 속 깊은 곳에서 빛나는 무언가를 발견했다. 가까이 다가가자, 그것은 마치 살아있는 것처럼 맥박치며 빛을 내뿜고 있었다.

"무엇이지?" 소녀는 조심스럽게 손을 뻗었다. 손끝이 빛에 닿는 순간, 온 몸으로 따뜻한 기운이 퍼져나갔다. 그리고 그녀의 머릿속에 낯선 목소리가 울려 퍼졌다. "드디어 찾았구나, 계승자여."

소녀는 깜짝 놀라 뒤로 물러섰다. 하지만 빛은 그녀를 따라왔다. 마치 그녀에게 이끌리듯이. "계승자라니, 무슨 말이에요?" 소녀가 떨리는 목소리로 물었다.

빛이 점점 형체를 갖추기 시작했다. 작은 정령의 모습이었다. 투명한 날개를 가진 그 존재는 소녀의 눈높이에 맞춰 떠올랐다. "천 년 전, 이 숲을 지키던 수호자가 있었어. 그리고 너는 그의 마지막 후손이야."

소녀의 심장이 빠르게 뛰기 시작했다. 할머니가 어릴 적 들려주셨던 옛 이야기가 떠올랐다. 그때는 그저 동화라고 생각했는데... "그래서 저에게 원하는 게 뭔가요?" 소녀는 용기를 내어 물었다.`,
  authors: ["별지기", "숲의여행자", "달빛작가", "새벽이슬"],
  totalTurns: 5,
}

export default async function FullStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // In production, fetch story data using the id
  const story = sampleStory

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href={`/story/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>이야기로 돌아가기</span>
        </Link>

        {/* Reading Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            스토리 합본
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {story.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
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
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{story.totalTurns}개의 턴</span>
            <span>|</span>
            <span>{story.authors.length}명의 작가</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {story.likes}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <article className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-sm mb-8">
          <div className="prose prose-lg max-w-none">
            {story.content.split("\n\n").map((paragraph, index) => (
              <p
                key={index}
                className="text-card-foreground leading-relaxed mb-6 last:mb-0 text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Authors */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            참여 작가
          </h3>
          <div className="flex flex-wrap gap-2">
            {story.authors.map((author) => (
              <span
                key={author}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {author}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 text-center">
          <Link href={`/story/${id}`}>
            <Button size="lg" className="gap-2">
              이야기 이어쓰기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
