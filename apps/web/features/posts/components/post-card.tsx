import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export function PostCard({ title, body }: { title: string; body: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="first-letter:uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-muted-foreground first-letter:uppercase">
          {body}
        </p>
      </CardContent>
    </Card>
  )
}
