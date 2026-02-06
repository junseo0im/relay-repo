import Link from "next/link"

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const BookIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-muted-foreground/60"
  >
    <rect
      x="25"
      y="20"
      width="70"
      height="80"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line
      x1="60"
      y1="20"
      x2="60"
      y2="100"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 2"
    />
    <path
      d="M35 45 L55 45 M35 55 L50 55 M35 65 L52 65"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="85" cy="35" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path
      d="M82 35 L85 38 L88 32"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-muted/30 mb-4 flex items-center justify-center">
        {icon ?? <BookIllustration />}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link href={actionHref}>
            <Button variant="default" className="gap-2">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="default" onClick={onAction} className="gap-2">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}
