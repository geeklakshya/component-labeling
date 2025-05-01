import { Card, CardContent } from "@/components/ui/card"
import { Layers, Grid2X2 } from "lucide-react"

interface ComponentStatsProps {
  totalComponents: number | null
  groupsFound: number | null
}

export function ComponentStats({ totalComponents, groupsFound }: ComponentStatsProps) {
  if (totalComponents === null && groupsFound === null) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Connected Components</p>
            <p className="text-2xl font-bold">{totalComponents !== null ? totalComponents : "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Grid2X2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Grouped Components</p>
            <p className="text-2xl font-bold">{groupsFound !== null ? groupsFound : "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
