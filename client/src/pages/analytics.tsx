import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCards } from "@/components/metrics-cards";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { AnalyticsMetrics } from "@shared/schema";
import { agentNames, agentColors } from "@/lib/agent-utils";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery<AnalyticsMetrics>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const agentPerformanceData = Object.entries(metrics.agentPerformance || {}).map(
    ([agent, perf]) => ({
      name: agentNames[agent as keyof typeof agentNames],
      tasks: perf.tasksCompleted,
      successRate: perf.successRate,
      avgDuration: (perf.avgDuration / 1000).toFixed(1),
      fill: agentColors[agent as keyof typeof agentColors].bg,
    })
  );

  const toolUsageData = Object.entries(metrics.toolUsageStats || {}).map(
    ([tool, stats]) => ({
      name: tool,
      count: stats.count,
      successRate: stats.successRate,
    })
  );

  const statusData = [
    { name: "Successful", value: metrics.successfulExecutions, color: "hsl(142 76% 45%)" },
    { name: "Failed", value: metrics.failedExecutions, color: "hsl(0 84% 60%)" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Performance metrics and insights across all executions
        </p>
      </div>

      {/* Metrics */}
      <MetricsCards
        totalExecutions={metrics.totalExecutions}
        successfulExecutions={metrics.successfulExecutions}
        failedExecutions={metrics.failedExecutions}
        avgExecutionTime={metrics.avgExecutionTime}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Agent Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Agent Performance
            </CardTitle>
            <CardDescription>Tasks completed by each agent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Execution Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Status</CardTitle>
            <CardDescription>Success vs failure distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Usage Chart */}
        {toolUsageData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tool Usage Statistics</CardTitle>
              <CardDescription>Frequency of tool usage across executions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={toolUsageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agent Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Agent Metrics</CardTitle>
          <CardDescription>Comprehensive performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Agent</th>
                  <th className="text-right p-3 font-medium">Tasks Completed</th>
                  <th className="text-right p-3 font-medium">Success Rate</th>
                  <th className="text-right p-3 font-medium">Avg. Duration</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformanceData.map((agent) => (
                  <tr key={agent.name} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{agent.name}</td>
                    <td className="text-right p-3 font-mono">{agent.tasks}</td>
                    <td className="text-right p-3 font-mono">{agent.successRate.toFixed(1)}%</td>
                    <td className="text-right p-3 font-mono">{agent.avgDuration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
