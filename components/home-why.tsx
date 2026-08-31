import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HOME_WHY } from "@/lib/why"

export function HomeWhy() {
  return (
    <section aria-label="다른 점" className="mt-6">
      <h2 className="text-sm font-medium text-muted-foreground">여기가 다른 점</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {HOME_WHY.map((item) => (
          <li key={item.title}>
            <Card size="sm" className="h-full rounded-2xl ring-foreground/8">
              <CardHeader>
                <CardTitle className="text-[15px] font-semibold">{item.title}</CardTitle>
                <CardDescription className="text-pretty break-keep leading-6">
                  {item.body}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
