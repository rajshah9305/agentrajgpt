import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

interface MetricsCardsProps {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
}

export function MetricsCards({
  totalExecutions,
  successfulExecutions,
  failedExecutions,
  avgExecutionTime,
}: MetricsCardsProps) {
  const successRate = totalExecutions > 0 
    ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
    : "0.0";

  const metrics = [
    {
      title: "Total Executions",
      value: totalExecutions,
      icon: Activity,
      color: "text-blue-500",
      testId: "metric-total",
    },
    {
      title: "Successful",
      value: successfulExecutions,
      icon: CheckCircle2,
      color: "text-green-500",
      subtitle: `${successRate}% success rate`,
      testId: "metric-successful",
    },
    {
      title: "Failed",
      value: failedExecutions,
      icon: XCircle,
      color: "text-red-500",
      testId: "metric-failed",
    },
    {
      title: "Avg. Duration",
      value: `${(avgExecutionTime / 1000).toFixed(1)}s`,
      icon: Clock,
      color: "text-purple-500",
      testId: "metric-duration",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover-elevate" data-testid={`card-${metric.testId}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono" data-testid={`text-${metric.testId}`}>
                {metric.value}
              </div>
              {metric.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
