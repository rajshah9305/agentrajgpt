import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentType, AgentState } from "@shared/schema";
import { agentNames, getAgentColor } from "@/lib/agent-utils";
import { Network } from "lucide-react";

interface AgentVisualizerProps {
  agents: Record<AgentType, AgentState>;
  currentAgent?: AgentType;
}

export function AgentVisualizer({ agents, currentAgent }: AgentVisualizerProps) {
  const agentTypes: AgentType[] = ["planner", "executor", "researcher", "coder", "analyst"];

  return (
    <Card className="h-full" data-testid="card-agent-visualizer">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Agent Network</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
            {/* Connection lines */}
            <g className="opacity-20">
              {agentTypes.map((fromAgent, fromIndex) => {
                return agentTypes.slice(fromIndex + 1).map((toAgent, toIndex) => {
                  const fromPos = getAgentPosition(fromIndex, agentTypes.length);
                  const toPos = getAgentPosition(fromIndex + toIndex + 1, agentTypes.length);
                  
                  return (
                    <line
                      key={`${fromAgent}-${toAgent}`}
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                });
              })}
            </g>

            {/* Agent nodes */}
            {agentTypes.map((agent, index) => {
              const pos = getAgentPosition(index, agentTypes.length);
              const agentColor = getAgentColor(agent);
              const isActive = agents[agent]?.status === "active";
              const isCurrent = currentAgent === agent;

              return (
                <g key={agent} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Pulse animation for active agent */}
                  {isActive && (
                    <circle
                      r="25"
                      fill={agentColor}
                      opacity="0.3"
                      className="animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                  )}

                  {/* Main node circle */}
                  <circle
                    r="20"
                    fill={isCurrent ? agentColor : "hsl(var(--card))"}
                    stroke={agentColor}
                    strokeWidth={isCurrent ? "3" : "2"}
                    className="transition-all duration-300"
                    opacity={isActive || isCurrent ? "1" : "0.6"}
                  />

                  {/* Status indicator dot */}
                  <circle
                    cx="12"
                    cy="-12"
                    r="4"
                    fill={
                      agents[agent]?.status === "active"
                        ? "hsl(142 76% 45%)"
                        : agents[agent]?.status === "error"
                        ? "hsl(0 84% 60%)"
                        : "hsl(222 8% 70%)"
                    }
                    stroke="hsl(var(--card))"
                    strokeWidth="2"
                  />

                  {/* Agent label */}
                  <text
                    y="40"
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="11"
                    fontWeight="500"
                    className="font-sans"
                  >
                    {agentNames[agent]}
                  </text>
                </g>
              );
            })}

            {/* Data flow animation for current agent */}
            {currentAgent && (
              <AnimatedDataFlow
                from={agentTypes.indexOf(currentAgent)}
                to={(agentTypes.indexOf(currentAgent) + 1) % agentTypes.length}
                total={agentTypes.length}
                color={getAgentColor(currentAgent)}
              />
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>Error</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getAgentPosition(index: number, total: number) {
  const centerX = 200;
  const centerY = 125;
  const radius = 80;
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function AnimatedDataFlow({
  from,
  to,
  total,
  color,
}: {
  from: number;
  to: number;
  total: number;
  color: string;
}) {
  const fromPos = getAgentPosition(from, total);
  const toPos = getAgentPosition(to, total);

  return (
    <g>
      <line
        x1={fromPos.x}
        y1={fromPos.y}
        x2={toPos.x}
        y2={toPos.y}
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      <circle r="3" fill={color}>
        <animateMotion
          dur="1.5s"
          repeatCount="indefinite"
          path={`M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`}
        />
      </circle>
    </g>
  );
}
