import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MetricsCardsProps {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
}

const MotionCard = motion(Card);

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
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <MotionCard
            key={metric.title}
            className="hover-elevate"
            data-testid={`card-${metric.testId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
              >
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold font-mono"
                data-testid={`text-${metric.testId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {metric.value}
              </motion.div>
              {metric.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtitle}
                </p>
              )}
            </CardContent>
          </MotionCard>
        );
      })}
    </div>
  );
}
