// Reference: javascript_database blueprint
import {
  executions,
  tasks,
  agentLogs,
  toolUsage,
  type Execution,
  type Task,
  type AgentLog,
  type ToolUsage,
  type InsertExecution,
  type InsertTask,
  type InsertAgentLog,
  type InsertToolUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Executions
  createExecution(data: InsertExecution): Promise<Execution>;
  getExecution(id: string): Promise<Execution | undefined>;
  getAllExecutions(limit?: number): Promise<Execution[]>;
  updateExecution(id: string, data: Partial<Execution>): Promise<Execution>;

  // Tasks
  createTask(data: InsertTask): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByExecution(executionId: string): Promise<Task[]>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;

  // Agent Logs
  createAgentLog(data: InsertAgentLog): Promise<AgentLog>;
  getLogsByExecution(executionId: string): Promise<AgentLog[]>;
  getLogsByTask(taskId: string): Promise<AgentLog[]>;

  // Tool Usage
  createToolUsage(data: InsertToolUsage): Promise<ToolUsage>;
  getToolUsageByExecution(executionId: string): Promise<ToolUsage[]>;

  // Analytics
  getAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Executions
  async createExecution(data: InsertExecution): Promise<Execution> {
    const [execution] = await db.insert(executions).values(data).returning();
    return execution;
  }

  async getExecution(id: string): Promise<Execution | undefined> {
    const [execution] = await db
      .select()
      .from(executions)
      .where(eq(executions.id, id));
    return execution || undefined;
  }

  async getAllExecutions(limit: number = 50): Promise<Execution[]> {
    return await db
      .select()
      .from(executions)
      .orderBy(desc(executions.createdAt))
      .limit(limit);
  }

  async updateExecution(
    id: string,
    data: Partial<Execution>
  ): Promise<Execution> {
    const [execution] = await db
      .update(executions)
      .set(data)
      .where(eq(executions.id, id))
      .returning();
    return execution;
  }

  // Tasks
  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByExecution(executionId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.executionId, executionId))
      .orderBy(tasks.order);
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  // Agent Logs
  async createAgentLog(data: InsertAgentLog): Promise<AgentLog> {
    const [log] = await db.insert(agentLogs).values(data).returning();
    return log;
  }

  async getLogsByExecution(executionId: string): Promise<AgentLog[]> {
    return await db
      .select()
      .from(agentLogs)
      .where(eq(agentLogs.executionId, executionId))
      .orderBy(agentLogs.timestamp);
  }

  async getLogsByTask(taskId: string): Promise<AgentLog[]> {
    return await db
      .select()
      .from(agentLogs)
      .where(eq(agentLogs.taskId, taskId))
      .orderBy(agentLogs.timestamp);
  }

  // Tool Usage
  async createToolUsage(data: InsertToolUsage): Promise<ToolUsage> {
    const [usage] = await db.insert(toolUsage).values(data).returning();
    return usage;
  }

  async getToolUsageByExecution(executionId: string): Promise<ToolUsage[]> {
    return await db
      .select()
      .from(toolUsage)
      .where(eq(toolUsage.executionId, executionId))
      .orderBy(toolUsage.timestamp);
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const [totalStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        successful: sql<number>`count(*) filter (where ${executions.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${executions.status} = 'failed')::int`,
      })
      .from(executions);

    const [avgTime] = await db
      .select({
        avgDuration: sql<number>`
          coalesce(
            avg(
              extract(epoch from (${executions.completedAt} - ${executions.createdAt})) * 1000
            )::int,
            0
          )
        `,
      })
      .from(executions)
      .where(sql`${executions.completedAt} is not null`);

    const agentStats = await db
      .select({
        agentType: tasks.agentType,
        completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
        total: sql<number>`count(*)::int`,
        avgDuration: sql<number>`
          coalesce(
            avg(
              extract(epoch from (${tasks.completedAt} - ${tasks.startedAt})) * 1000
            )::int,
            0
          )
        `,
      })
      .from(tasks)
      .groupBy(tasks.agentType);

    const toolStats = await db
      .select({
        toolName: toolUsage.toolName,
        count: sql<number>`count(*)::int`,
        successful: sql<number>`count(*) filter (where ${toolUsage.success} = true)::int`,
      })
      .from(toolUsage)
      .groupBy(toolUsage.toolName);

    const agentPerformance: any = {};
    agentStats.forEach((stat) => {
      agentPerformance[stat.agentType] = {
        tasksCompleted: stat.completed,
        successRate: stat.total > 0 ? (stat.completed / stat.total) * 100 : 0,
        avgDuration: stat.avgDuration,
      };
    });

    const toolUsageStats: any = {};
    toolStats.forEach((stat) => {
      toolUsageStats[stat.toolName] = {
        count: stat.count,
        successRate: stat.count > 0 ? (stat.successful / stat.count) * 100 : 0,
      };
    });

    return {
      totalExecutions: totalStats?.total || 0,
      successfulExecutions: totalStats?.successful || 0,
      failedExecutions: totalStats?.failed || 0,
      avgExecutionTime: avgTime?.avgDuration || 0,
      agentPerformance,
      toolUsageStats,
    };
  }
}

export const storage = new DatabaseStorage();
