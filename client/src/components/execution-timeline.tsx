import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@shared/schema";
import { agentNames, getAgentColor, getRelativeTime } from "@/lib/agent-utils";
import { Clock, CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";

interface ExecutionTimelineProps {
  tasks: Task[];
}

export function ExecutionTimeline({ tasks }: ExecutionTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="flex flex-col h-full" data-testid="card-execution-timeline">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Task Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4" data-testid="timeline-container">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <p>No tasks yet</p>
              </div>
            ) : (
              <div className="relative space-y-4">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

                {tasks.map((task, index) => {
                  const agentColor = getAgentColor(task.agentType as any);

                  return (
                    <div key={task.id} className="relative pl-8" data-testid={`task-${index}`}>
                      {/* Timeline node */}
                      <div className="absolute left-0 top-1">
                        {getStatusIcon(task.status)}
                      </div>

                      <div className="space-y-2 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                borderLeft: `3px solid ${agentColor}`,
                              }}
                            >
                              {agentNames[task.agentType as any] || task.agentType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                              data-testid={`badge-task-status-${index}`}
                            >
                              {task.status}
                            </Badge>
                          </div>
                          {task.createdAt && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {getRelativeTime(new Date(task.createdAt))}
                            </span>
                          )}
                        </div>

                        <p className="text-sm" data-testid={`text-task-description-${index}`}>
                          {task.description}
                        </p>

                        {task.result && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs">
                            <p className="text-muted-foreground mb-1">Result:</p>
                            <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap" data-testid={`text-task-result-${index}`}>
                              {typeof task.result === 'string' 
                                ? task.result 
                                : JSON.stringify(task.result as any, null, 2)}
                            </pre>
                          </div>
                        )}

                        {task.error && (
                          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs">
                            <p className="text-destructive font-medium mb-1">Error:</p>
                            <p className="text-destructive/80" data-testid={`text-task-error-${index}`}>{task.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
