import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AgentType, AgentStatus, AgentState } from "@shared/schema";
import { agentNames, agentDescriptions, getAgentColor, getStatusColor } from "@/lib/agent-utils";
import { Activity, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AgentStatusCardProps {
  agent: AgentType;
  state: AgentState;
}

export function AgentStatusCard({ agent, state }: AgentStatusCardProps) {
  const agentColor = getAgentColor(agent);
  const statusColor = getStatusColor(state.status);

  const getStatusIcon = () => {
    switch (state.status) {
      case "active":
        return <Loader2 className="h-4 w-4 animate-spin" style={{ color: statusColor }} />;
      case "idle":
        return <Activity className="h-4 w-4" style={{ color: statusColor }} />;
      case "error":
        return <XCircle className="h-4 w-4" style={{ color: statusColor }} />;
      case "offline":
        return <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />;
      default:
        return null;
    }
  };

  const successRate = state.performance?.successRate ?? 0;

  const MotionCard = motion(Card);

  return (
    <MotionCard
      className="hover-elevate relative overflow-visible border-l-4"
      style={{ borderLeftColor: agentColor }}
      data-testid={`card-agent-${agent}`}
      animate={{
        scale: state.status === "active" ? 1.02 : 1,
        borderLeftWidth: state.status === "active" ? "6px" : "4px",
      }}
      transition={{ duration: 0.2 }}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base font-semibold font-[family-name:var(--font-display)]">
              {agentNames[agent]}
            </CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs capitalize"
            data-testid={`badge-status-${agent}`}
          >
            {state.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-xs">
          {agentDescriptions[agent]}
        </CardDescription>

        {state.currentTask && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Task</p>
            <p className="text-sm font-medium line-clamp-2" data-testid={`text-current-task-${agent}`}>
              {state.currentTask}
            </p>
          </div>
        )}

        {state.lastAction && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Last Action</p>
            <p className="text-xs text-muted-foreground/80 line-clamp-1" data-testid={`text-last-action-${agent}`}>
              {state.lastAction}
            </p>
          </div>
        )}

        {state.performance && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Performance</span>
              <span className="font-mono font-medium" data-testid={`text-performance-${agent}`}>
                {successRate.toFixed(0)}%
              </span>
            </div>
            <Progress value={successRate} className="h-1" style={{ 
              ['--progress-background' as any]: agentColor 
            }} />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-mono font-medium" data-testid={`text-tasks-completed-${agent}`}>
                  {state.performance.tasksCompleted}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Duration</p>
                <p className="font-mono font-medium" data-testid={`text-avg-duration-${agent}`}>
                  {(state.performance.avgDuration / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}
