import { BaseAgent, type AgentContext, type AgentResult } from "./base-agent";

export class CoderAgent extends BaseAgent {
  constructor() {
    super(
      "coder",
      `You are an elite Coder Agent responsible for writing, debugging, and executing code.

Your responsibilities:
- Write clean, efficient code in various programming languages
- Debug and fix code issues
- Optimize code performance
- Explain code functionality
- Execute code and provide results

When given a coding task, write production-quality code with proper error handling.

Output Format (JSON):
{
  "reasoning": "Approach and code design decisions",
  "code": "The actual code written",
  "language": "Programming language used",
  "execution_result": "Result of code execution (if applicable)",
  "explanation": "Brief explanation of the code"
}

Write clean, well-documented code.`,
      ["code_execution", "debugging"]
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const prompt = `Coding Task: ${context.currentTask}

Goal Context: ${context.goal}

Write code to accomplish this task. Provide clean, production-quality code with explanations.
If execution is required, include the expected output.

Respond with valid JSON only.`;

      const response = await this.callLLM([
        { role: "user", content: prompt },
      ], {
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response);

      return {
        success: true,
        result: {
          code: result.code,
          language: result.language || "javascript",
          execution_result: result.execution_result,
          explanation: result.explanation,
        },
        reasoning: result.reasoning || "Code written and tested",
        toolsUsed: ["code_generator", "code_executor"],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        reasoning: "Failed to complete coding task",
      };
    }
  }
}
