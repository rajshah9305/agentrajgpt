import { BaseAgent, type AgentContext, type AgentResult } from "./base-agent";
import type { AgentType } from "@shared/schema";

export class PlannerAgent extends BaseAgent {
  constructor() {
    super(
      "planner",
      `You are an elite Planner Agent responsible for breaking down complex goals into actionable subtasks.
      
Your responsibilities:
- Analyze the user's goal and understand the requirements
- Break down the goal into a sequence of concrete, achievable subtasks
- Assign each subtask to the most appropriate agent: executor, researcher, coder, or analyst
- Ensure tasks are ordered logically with clear dependencies
- Create a comprehensive plan that will accomplish the goal

Output Format (JSON):
{
  "reasoning": "Brief explanation of your planning approach",
  "tasks": [
    {
      "description": "Clear, specific task description",
      "agentType": "executor | researcher | coder | analyst",
      "dependencies": []
    }
  ]
}

Available Agents:
- executor: Executes API calls, system tasks, and general operations
- researcher: Performs web searches, data gathering, and scraping
- coder: Writes, debugs, and executes code in various languages
- analyst: Processes data, generates insights, and creates summaries

Be thorough, specific, and ensure the plan will fully achieve the goal.`,
      []
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const prompt = `Goal: ${context.goal}

Create a detailed execution plan with specific tasks assigned to appropriate agents.
Each task should be concrete and achievable by the assigned agent.

Respond with valid JSON only.`;

      const response = await this.callLLM([
        { role: "user", content: prompt },
      ], {
        response_format: { type: "json_object" },
      });

      const plan = JSON.parse(response);

      if (!plan.tasks || !Array.isArray(plan.tasks)) {
        throw new Error("Invalid plan format");
      }

      return {
        success: true,
        result: plan.tasks,
        reasoning: plan.reasoning || "Created execution plan",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        reasoning: "Failed to create execution plan",
      };
    }
  }
}
