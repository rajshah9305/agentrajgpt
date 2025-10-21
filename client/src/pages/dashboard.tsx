import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AgentStatusCard } from "@/components/agent-status-card";
import { AgentVisualizer } from "@/components/agent-visualizer";
import { TaskInput } from "@/components/task-input";
import { ExecutionOutput } from "@/components/execution-output";
import { ExecutionTimeline } from "@/components/execution-timeline";
import { MetricsCards } from "@/components/metrics-cards";
import type { AgentType, AgentState, Execution, Task, AgentLog, ExecutionUpdate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const [agentStates, setAgentStates] = useState<Record<AgentType, AgentState>>({
    planner: { type: "planner", status: "idle" },
    executor: { type: "executor", status: "idle" },
    researcher: { type: "researcher", status: "idle" },
    coder: { type: "coder", status: "idle" },
    analyst: { type: "analyst", status: "idle" },
  });

  const [currentAgent, setCurrentAgent] = useState<AgentType>();
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null);
  const [liveLogs, setLiveLogs] = useState<AgentLog[]>([]);
  const [liveTasks, setLiveTasks] = useState<Task[]>([]);

  // Fetch analytics metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  // Fetch recent executions
  const { data: executions, isLoading: executionsLoading } = useQuery<Execution[]>({
    queryKey: ["/api/executions"],
  });

  // Create execution mutation
  const createExecutionMutation = useMutation({
    mutationFn: async (goal: string) => {
      const response = await apiRequest("POST", "/api/executions", { goal });
      return response as Execution;
    },
    onSuccess: (execution: Execution) => {
      setCurrentExecution(execution);
      setLiveLogs([]);
      setLiveTasks([]);
      queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
      toast({
        title: "Execution Started",
        description: "AI agents are working on your goal...",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // WebSocket for real-time updates
  useWebSocket("/ws", {
    onMessage: (data) => {
      if (data.type === "execution_update") {
        const update: ExecutionUpdate = data.payload;
        
        if (update.currentAgent) {
          setCurrentAgent(update.currentAgent);
          setAgentStates((prev) => ({
            ...prev,
            [update.currentAgent!]: {
              ...prev[update.currentAgent!],
              status: "active",
              currentTask: update.currentTask,
            },
          }));
        }

        if (update.status === "completed" || update.status === "failed") {
          queryClient.invalidateQueries({ queryKey: ["/api/executions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
          
          setCurrentAgent(undefined);
          Object.keys(agentStates).forEach((agent) => {
            setAgentStates((prev) => ({
              ...prev,
              [agent]: { ...prev[agent as AgentType], status: "idle", currentTask: undefined },
            }));
          });
        }
      } else if (data.type === "task_update") {
        setLiveTasks((prev) => {
          const existing = prev.find((t) => t.id === data.payload.id);
          if (existing) {
            return prev.map((t) => (t.id === data.payload.id ? data.payload : t));
          }
          return [...prev, data.payload];
        });
      } else if (data.type === "log") {
        setLiveLogs((prev) => [...prev, data.payload]);
      } else if (data.type === "agent_performance") {
        const { agentType, performance } = data.payload;
        setAgentStates((prev) => ({
          ...prev,
          [agentType]: {
            ...prev[agentType],
            performance,
          },
        }));
      }
    },
  });

  const handleSubmitGoal = (goal: string) => {
    createExecutionMutation.mutate(goal);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          RAJGPT Dashboard
        </h1>
        <p className="text-muted-foreground">
          Elite multi-agent AI orchestration platform
        </p>
      </div>

      {/* Metrics */}
      <MetricsCards
        totalExecutions={(metrics as any)?.totalExecutions || 0}
        successfulExecutions={(metrics as any)?.successfulExecutions || 0}
        failedExecutions={(metrics as any)?.failedExecutions || 0}
        avgExecutionTime={(metrics as any)?.avgExecutionTime || 0}
      />

      {/* Agent Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {(["planner", "executor", "researcher", "coder", "analyst"] as AgentType[]).map(
          (agentType) => (
            <AgentStatusCard
              key={agentType}
              agent={agentType}
              state={agentStates[agentType]}
            />
          )
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <TaskInput
            onSubmit={handleSubmitGoal}
            isLoading={createExecutionMutation.isPending}
          />
          <AgentVisualizer agents={agentStates} currentAgent={currentAgent} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="h-[400px]">
            <ExecutionOutput logs={liveLogs} isLive={!!currentExecution} />
          </div>
          <div className="h-[400px]">
            <ExecutionTimeline tasks={liveTasks} />
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-display)]">
          Recent Executions
        </h2>
        {executionsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : executions && executions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {executions.slice(0, 6).map((execution) => (
              <a
                key={execution.id}
                href={`/execution/${execution.id}`}
                className="block"
                data-testid={`link-execution-${execution.id}`}
              >
                <div className="p-4 border rounded-lg hover-elevate active-elevate-2 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium line-clamp-2">
                      {execution.goal}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        execution.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : execution.status === "failed"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {execution.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(execution.createdAt).toLocaleString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No executions yet. Submit a goal above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
