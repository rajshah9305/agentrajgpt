import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Agent Types
export type AgentType = "planner" | "executor" | "researcher" | "coder" | "analyst";
export type AgentStatus = "idle" | "active" | "error" | "offline";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type ExecutionStatus = "pending" | "planning" | "executing" | "analyzing" | "completed" | "failed";

// Executions table - stores user goals and overall execution results
export const executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goal: text("goal").notNull(),
  status: text("status").notNull().default("pending"),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

// Tasks table - individual subtasks created by the Planner agent
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: varchar("execution_id").notNull().references(() => executions.id, { onDelete: "cascade" }),
  agentType: text("agent_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  result: jsonb("result"),
  error: text("error"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"),
});

// Agent Logs - detailed logs of agent actions and reasoning
export const agentLogs = pgTable("agent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: varchar("execution_id").notNull().references(() => executions.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  agentType: text("agent_type").notNull(),
  action: text("action").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  reasoning: text("reasoning"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata"),
});

// Tool Usage - tracks which tools were used by agents
export const toolUsage = pgTable("tool_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: varchar("execution_id").notNull().references(() => executions.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  toolName: text("tool_name").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  success: boolean("success").notNull().default(true),
  duration: integer("duration"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  error: text("error"),
});

// Relations
export const executionsRelations = relations(executions, ({ many }) => ({
  tasks: many(tasks),
  logs: many(agentLogs),
  toolUsage: many(toolUsage),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  execution: one(executions, {
    fields: [tasks.executionId],
    references: [executions.id],
  }),
  logs: many(agentLogs),
  toolUsage: many(toolUsage),
}));

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  execution: one(executions, {
    fields: [agentLogs.executionId],
    references: [executions.id],
  }),
  task: one(tasks, {
    fields: [agentLogs.taskId],
    references: [tasks.id],
  }),
}));

export const toolUsageRelations = relations(toolUsage, ({ one }) => ({
  execution: one(executions, {
    fields: [toolUsage.executionId],
    references: [executions.id],
  }),
  task: one(tasks, {
    fields: [toolUsage.taskId],
    references: [tasks.id],
  }),
}));

// Zod schemas for validation
export const insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertAgentLogSchema = createInsertSchema(agentLogs).omit({
  id: true,
  timestamp: true,
});

export const insertToolUsageSchema = createInsertSchema(toolUsage).omit({
  id: true,
  timestamp: true,
});

// TypeScript types
export type Execution = typeof executions.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;

export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;

// Frontend-specific types for real-time updates
export interface AgentState {
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  lastAction?: string;
  performance?: {
    tasksCompleted: number;
    successRate: number;
    avgDuration: number;
  };
}

export interface ExecutionUpdate {
  executionId: string;
  status: ExecutionStatus;
  currentAgent?: AgentType;
  currentTask?: string;
  progress?: number;
  timestamp: number;
}

export interface TaskUpdate {
  taskId: string;
  status: TaskStatus;
  agentType: AgentType;
  progress?: number;
  output?: any;
  error?: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  executionId: string;
  taskId?: string;
  agentType: AgentType;
  action: string;
  reasoning?: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
}

export interface AnalyticsMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  agentPerformance: Record<AgentType, {
    tasksCompleted: number;
    successRate: number;
    avgDuration: number;
  }>;
  toolUsageStats: Record<string, {
    count: number;
    successRate: number;
  }>;
}
