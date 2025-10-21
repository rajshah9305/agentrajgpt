import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExecutionOutput } from "@/components/execution-output";
import { ExecutionTimeline } from "@/components/execution-timeline";
import type { Execution, Task, AgentLog } from "@shared/schema";
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/agent-utils";

export default function ExecutionDetail() {
  const params = useParams();
  const executionId = params.id;

  const { data: execution, isLoading: executionLoading } = useQuery<Execution>({
    queryKey: ["/api/executions", executionId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/executions", executionId, "tasks"],
    enabled: !!executionId,
  });

  const { data: logs = [] } = useQuery<AgentLog[]>({
    queryKey: ["/api/executions", executionId, "logs"],
    enabled: !!executionId,
  });

  if (executionLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Execution not found</p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const duration = execution.completedAt
    ? new Date(execution.completedAt).getTime() - new Date(execution.createdAt).getTime()
    : Date.now() - new Date(execution.createdAt).getTime();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="w-fit"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Execution Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl font-[family-name:var(--font-display)]">
                  Execution Details
                </CardTitle>
                <Badge
                  variant={
                    execution.status === "completed"
                      ? "default"
                      : execution.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                  className="capitalize"
                  data-testid="badge-execution-status"
                >
                  {execution.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {execution.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                  {execution.status}
                </Badge>
              </div>
              <CardDescription className="text-base" data-testid="text-execution-goal">
                {execution.goal}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started</span>
              </div>
              <p className="text-sm font-mono" data-testid="text-created-at">
                {new Date(execution.createdAt).toLocaleString()}
              </p>
            </div>

            {execution.completedAt && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Completed</span>
                </div>
                <p className="text-sm font-mono" data-testid="text-completed-at">
                  {new Date(execution.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <p className="text-sm font-mono" data-testid="text-duration">
                {formatDuration(duration)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Tasks</span>
              </div>
              <p className="text-sm font-mono" data-testid="text-tasks-count">
                {tasks.filter((t) => t.status === "completed").length} / {tasks.length}
              </p>
            </div>
          </div>

          {execution.error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm font-medium text-destructive mb-1">Error</p>
              <p className="text-sm text-destructive/80" data-testid="text-execution-error">
                {execution.error}
              </p>
            </div>
          )}

          {execution.result && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-2">Result</p>
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap" data-testid="text-execution-result">
                {typeof execution.result === 'string'
                  ? execution.result
                  : JSON.stringify(execution.result as any, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline and Logs */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-[600px]">
          <ExecutionTimeline tasks={tasks} />
        </div>
        <div className="h-[600px]">
          <ExecutionOutput logs={logs} />
        </div>
      </div>
    </div>
  );
}
