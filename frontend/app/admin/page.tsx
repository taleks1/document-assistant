"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { weeklyData } from "@/lib/mock-data"
import {
  getAdminStats,
  getRequestsByStatus,
  getRequestsByType,
  getMonthlyActivity,
  requestTypeLabels,
  statusLabels,
} from "@/lib/mock-data"

import {
  FileText,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export default function ReportsPage() {
  const stats = getAdminStats()
  const statusData = getRequestsByStatus()
  const typeData = getRequestsByType()
  const monthlyData = getMonthlyActivity()

  const approvalRate = ((stats.approved / stats.total) * 100).toFixed(1)
  const rejectionRate = ((stats.rejected / stats.total) * 100).toFixed(1)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Контролна табла
          </h1>
          <p className="text-muted-foreground">
            Аналитика и увид за административните барања
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Monthly Requests Trend */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Месечен тренд на барања</CardTitle>
            <CardDescription>
              Обем на барања во последните 6 месеци
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [value, "Барања"]}
                  />

                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Requests by Status */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Распределба по статус</CardTitle>
            <CardDescription>
              Тековна распределба на сите барања
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      statusLabels[name as keyof typeof statusLabels] ?? name,
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "18px" }}
                    formatter={(value) =>
                      statusLabels[value as keyof typeof statusLabels] ?? value
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <div className="mb-8 flex justify-center">
        <Card className="w-full max-w-4xl border-border shadow-sm">
          <CardHeader className="text-center">
            <CardTitle>Неделна активност</CardTitle>
            <CardDescription>
              Поднесени барања по ден оваа недела
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />

                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [value, "Барања"]}
                  />

                  <Bar
                    dataKey="requests"
                    fill="var(--chart-2)"
                    radius={[8, 8, 0, 0]}
                    barSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Барања по тип</CardTitle>
            <CardDescription>
              Распределба на категориите на барања
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {typeData.map((item, index) => (
                <div key={item.type} className="flex items-center gap-4">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {requestTypeLabels[item.type as keyof typeof requestTypeLabels] ?? item.type}
                      </span>

                      <span className="text-muted-foreground">
                        {item.count} ({((item.count / stats.total) * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.count / stats.total) * 100}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Перформансни метрики</CardTitle>
            <CardDescription>
              Клучни показатели на успешност
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">
                  Стапка на одобрени
                </span>
                <span className="text-lg font-bold text-success">
                  {approvalRate}%
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <span className="text-sm text-muted-foreground">
                  Стапка на одбиени
                </span>
                <span className="text-lg font-bold text-destructive">
                  {rejectionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ActivityItem({
  icon,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode
  bg: string
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}