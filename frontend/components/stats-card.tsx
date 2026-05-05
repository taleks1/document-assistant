"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-[0_2px_10px_rgba(16,24,40,0.04)] backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>

            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}

            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% од последниот месец
              </p>
            )}
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary text-primary shadow-[0_1px_4px_rgba(16,24,40,0.03)]">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}