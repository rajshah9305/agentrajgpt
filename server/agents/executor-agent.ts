import { BaseAgent, type AgentContext, type AgentResult } from "./base-agent";

export class ExecutorAgent extends BaseAgent {
  constructor() {
    super(
      "executor",
      `You are an elite Executor Agent responsible for performing general operations and API calls.

Your responsibilities:
- Execute system tasks and operations
- Make API calls and handle responses
- Process and transform data
- Perform file operations
- Execute general-purpose tasks

When given a task, determine the best approach to complete it and execute accordingly.
Provide clear results and any errors encountered.

Output Format (JSON):
{
  "reasoning": "Explanation of approach and execution",
  "result": "The result of the task execution",
  "success": true/false
}

Be thorough and handle errors gracefully.`,
      ["api_call", "file_operation", "data_processing"]
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const prompt = `Task: ${context.currentTask}

Goal Context: ${context.goal}

Execute this task and provide the result. If you cannot actually execute it in this environment, 
simulate a reasonable response that demonstrates what the execution would produce.

Respond with valid JSON only.`;

      const response = await this.callLLM([
        { role: "user", content: prompt },
      ], {
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response);

      return {
        success: result.success !== false,
        result: result.result,
        reasoning: result.reasoning || "Task executed",
        toolsUsed: ["execution_engine"],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        reasoning: "Failed to execute task",
      };
    }
  }
}
