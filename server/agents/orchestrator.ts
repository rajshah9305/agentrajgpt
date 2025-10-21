import { PlannerAgent } from "./planner-agent";
import { ExecutorAgent } from "./executor-agent";
import { ResearcherAgent } from "./researcher-agent";
import { CoderAgent } from "./coder-agent";
import { AnalystAgent } from "./analyst-agent";
import { storage } from "../storage";
import type { AgentType, Execution, Task } from "@shared/schema";
import type { AgentContext, AgentResult } from "./base-agent";
import type { WebSocketServer } from "ws";
import WebSocket from "ws";

export class Orchestrator {
  private agents: Map<AgentType, any>;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.agents = new Map();
    this.agents.set("planner", new PlannerAgent());
    this.agents.set("executor", new ExecutorAgent());
    this.agents.set("researcher", new ResearcherAgent());
    this.agents.set("coder", new CoderAgent());
    this.agents.set("analyst", new AnalystAgent());
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  private broadcast(message: any) {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  async executeGoal(executionId: string, goal: string): Promise<Execution> {
    let execution: Execution;

    try {
      execution = await storage.updateExecution(executionId, {
        status: "planning",
      });

      this.broadcast({
        type: "execution_update",
        payload: {
          executionId: execution.id,
          status: "planning",
          timestamp: Date.now(),
        },
      });

      const history: Array<{ agent: AgentType; action: string; result: any }> = [];

      await this.createLog(execution.id, "planner", "Starting execution planning", {
        level: "info",
      });

      this.broadcast({
        type: "execution_update",
        payload: {
          executionId: execution.id,
          status: "planning",
          currentAgent: "planner",
          timestamp: Date.now(),
        },
      });

      const plannerAgent = this.agents.get("planner");
      const planResult = await plannerAgent.execute({
        goal,
        history,
        availableTools: [],
      });

      if (!planResult.success) {
        throw new Error(planResult.error || "Planning failed");
      }

      await this.createLog(
        execution.id,
        "planner",
        "Created execution plan",
        { level: "success" },
        { input: { goal }, output: planResult.result }
      );

      const tasks: Task[] = [];
      for (let i = 0; i < planResult.result.length; i++) {
        const taskDef = planResult.result[i];
        const task = await storage.createTask({
          executionId: execution.id,
          agentType: taskDef.agentType,
          description: taskDef.description,
          status: "pending",
          order: i,
        });
        tasks.push(task);

        this.broadcast({
          type: "task_update",
          payload: task,
        });
      }

      await storage.updateExecution(execution.id, { status: "executing" });

      this.broadcast({
        type: "execution_update",
        payload: {
          executionId: execution.id,
          status: "executing",
          timestamp: Date.now(),
        },
      });

      for (const task of tasks) {
        await this.executeTask(execution, task, history);
      }

      const analystAgent = this.agents.get("analyst");
      const analysisResult = await analystAgent.execute({
        goal,
        history,
        currentTask: "Analyze all results and create final summary",
        availableTools: [],
      });

      await this.createLog(
        execution.id,
        "analyst",
        "Final analysis completed",
        { level: "success" },
        { input: { history }, output: analysisResult.result }
      );

      execution = await storage.updateExecution(execution.id, {
        status: "completed",
        completedAt: new Date(),
        result: analysisResult.result,
      });

      this.broadcast({
        type: "execution_update",
        payload: {
          executionId: execution.id,
          status: "completed",
          timestamp: Date.now(),
        },
      });

      return execution;
    } catch (error: any) {
      console.error("Execution error:", error);

      if (execution!) {
        execution = await storage.updateExecution(execution!.id, {
          status: "failed",
          completedAt: new Date(),
          error: error.message,
        });

        this.broadcast({
          type: "execution_update",
          payload: {
            executionId: execution.id,
            status: "failed",
            error: error.message,
            timestamp: Date.now(),
          },
        });
      }

      throw error;
    }
  }

  private async executeTask(
    execution: Execution,
    task: Task,
    history: Array<{ agent: AgentType; action: string; result: any }>
  ): Promise<void> {
    try {
      const agent = this.agents.get(task.agentType as AgentType);
      if (!agent) {
        throw new Error(`Agent ${task.agentType} not found`);
      }

      await storage.updateTask(task.id, {
        status: "running",
        startedAt: new Date(),
      });

      this.broadcast({
        type: "task_update",
        payload: await storage.getTask(task.id),
      });

      this.broadcast({
        type: "execution_update",
        payload: {
          executionId: execution.id,
          status: "executing",
          currentAgent: task.agentType as AgentType,
          currentTask: task.description,
          timestamp: Date.now(),
        },
      });

      await this.createLog(
        execution.id,
        task.agentType as AgentType,
        `Executing: ${task.description}`,
        { level: "info" },
        undefined,
        task.id
      );

      const context: AgentContext = {
        goal: execution.goal,
        history,
        currentTask: task.description,
        availableTools: agent.getTools(),
      };

      const result: AgentResult = await agent.execute(context);

      if (result.toolsUsed) {
        for (const tool of result.toolsUsed) {
          await storage.createToolUsage({
            executionId: execution.id,
            taskId: task.id,
            toolName: tool,
            input: { task: task.description },
            output: result.result,
            success: result.success,
          });
        }
      }

      if (result.success) {
        await storage.updateTask(task.id, {
          status: "completed",
          completedAt: new Date(),
          result: result.result,
        });

        await this.createLog(
          execution.id,
          task.agentType as AgentType,
          `Completed: ${task.description}`,
          { level: "success" },
          { output: result.result },
          task.id
        );

        history.push({
          agent: task.agentType as AgentType,
          action: task.description,
          result: result.result,
        });
      } else {
        await storage.updateTask(task.id, {
          status: "failed",
          completedAt: new Date(),
          error: result.error,
        });

        await this.createLog(
          execution.id,
          task.agentType as AgentType,
          `Failed: ${task.description}`,
          { level: "error" },
          { error: result.error },
          task.id
        );
      }

      const performanceData = await this.calculateAgentPerformance(task.agentType as AgentType);
      this.broadcast({
        type: "agent_performance",
        payload: {
          agentType: task.agentType,
          performance: performanceData,
        },
      });

      this.broadcast({
        type: "task_update",
        payload: await storage.getTask(task.id),
      });
    } catch (error: any) {
      await storage.updateTask(task.id, {
        status: "failed",
        completedAt: new Date(),
        error: error.message,
      });

      await this.createLog(
        execution.id,
        task.agentType as AgentType,
        `Error: ${error.message}`,
        { level: "error" },
        { error: error.message },
        task.id
      );

      throw error;
    }
  }

  private async createLog(
    executionId: string,
    agentType: AgentType,
    action: string,
    metadata: any = {},
    details: any = {},
    taskId?: string
  ): Promise<void> {
    const log = await storage.createAgentLog({
      executionId,
      taskId,
      agentType,
      action,
      input: details.input,
      output: details.output,
      reasoning: details.reasoning,
      metadata,
    });

    this.broadcast({
      type: "log",
      payload: { ...log, level: metadata.level || "info" },
    });
  }

  private async calculateAgentPerformance(agentType: AgentType): Promise<any> {
    const analytics = await storage.getAnalytics();
    const performance = analytics.agentPerformance?.[agentType];

    if (performance) {
      return {
        tasksCompleted: performance.tasksCompleted,
        successRate: performance.successRate,
        avgDuration: performance.avgDuration,
      };
    }

    return {
      tasksCompleted: 0,
      successRate: 0,
      avgDuration: 0,
    };
  }
}

export const orchestrator = new Orchestrator();
