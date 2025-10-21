import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { orchestrator } from "./agents/orchestrator";
import { insertExecutionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Reference: javascript_websocket blueprint
  // Setup WebSocket server on /ws path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Set WebSocket server for orchestrator
  orchestrator.setWebSocketServer(wss);

  // API Routes

  // Create new execution
  app.post("/api/executions", async (req, res) => {
    try {
      const data = insertExecutionSchema.parse(req.body);

      // Create execution record
      const execution = await storage.createExecution({
        goal: data.goal,
        status: "pending",
      });

      // Start execution asynchronously with the created execution ID
      orchestrator.executeGoal(execution.id, data.goal).catch((error) => {
        console.error("Execution failed:", error);
      });

      res.json(execution);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all executions
  app.get("/api/executions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const executions = await storage.getAllExecutions(limit);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get execution by ID
  app.get("/api/executions/:id", async (req, res) => {
    try {
      const execution = await storage.getExecution(req.params.id);
      if (!execution) {
        return res.status(404).json({ error: "Execution not found" });
      }
      res.json(execution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get tasks for execution
  app.get("/api/executions/:id/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasksByExecution(req.params.id);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get logs for execution
  app.get("/api/executions/:id/logs", async (req, res) => {
    try {
      const logs = await storage.getLogsByExecution(req.params.id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
