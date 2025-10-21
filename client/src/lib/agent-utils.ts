import type { AgentType, AgentStatus } from "@shared/schema";

export const agentColors: Record<AgentType, { bg: string; border: string; text: string; chart: string }> = {
  planner: {
    bg: "hsl(260 70% 65%)",
    border: "hsl(260 70% 55%)",
    text: "text-[hsl(260_70%_65%)]",
    chart: "hsl(var(--chart-1))",
  },
  executor: {
    bg: "hsl(200 85% 55%)",
    border: "hsl(200 85% 45%)",
    text: "text-[hsl(200_85%_55%)]",
    chart: "hsl(var(--chart-2))",
  },
  researcher: {
    bg: "hsl(150 60% 55%)",
    border: "hsl(150 60% 45%)",
    text: "text-[hsl(150_60%_55%)]",
    chart: "hsl(var(--chart-3))",
  },
  coder: {
    bg: "hsl(30 85% 60%)",
    border: "hsl(30 85% 50%)",
    text: "text-[hsl(30_85%_60%)]",
    chart: "hsl(var(--chart-4))",
  },
  analyst: {
    bg: "hsl(280 65% 60%)",
    border: "hsl(280 65% 50%)",
    text: "text-[hsl(280_65%_60%)]",
    chart: "hsl(var(--chart-5))",
  },
};

export const agentNames: Record<AgentType, string> = {
  planner: "Planner",
  executor: "Executor",
  researcher: "Researcher",
  coder: "Coder",
  analyst: "Analyst",
};

export const agentDescriptions: Record<AgentType, string> = {
  planner: "Breaks down complex goals into actionable subtasks",
  executor: "Executes API calls and system tasks",
  researcher: "Performs web searches and data scraping",
  coder: "Writes, debugs, and executes code dynamically",
  analyst: "Processes and summarizes results with insights",
};

export function getAgentColor(agent: AgentType): string {
  return agentColors[agent].bg;
}

export function getAgentBorderColor(agent: AgentType): string {
  return agentColors[agent].border;
}

export function getAgentTextClass(agent: AgentType): string {
  return agentColors[agent].text;
}

export function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case "active":
      return "hsl(142 76% 45%)";
    case "idle":
      return "hsl(222 8% 70%)";
    case "error":
      return "hsl(0 84% 60%)";
    case "offline":
      return "hsl(222 8% 35%)";
    default:
      return "hsl(222 8% 50%)";
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
