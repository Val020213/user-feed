import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function PostCard({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="first-letter:uppercase">{title}</CardTitle>
        {children}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-muted-foreground first-letter:uppercase">
          {body}
        </p>
      </CardContent>
    </Card>
  )
}
