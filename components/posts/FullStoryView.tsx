"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Paragraph } from "@/lib/types"

interface FullStoryViewProps {
  title: string
  paragraphs: Paragraph[]
}

export function FullStoryView({ title, paragraphs }: FullStoryViewProps) {
  const [open, setOpen] = useState(false)

  const fullText = paragraphs
    .sort((a, b) => a.turnNumber - b.turnNumber)
    .map((p) => p.content)
    .join("\n\n")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <BookOpen className="h-4 w-4" />
          합본 보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap font-serif">
              {fullText}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
