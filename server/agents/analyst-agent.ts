import { BaseAgent, type AgentContext, type AgentResult } from "./base-agent";

export class AnalystAgent extends BaseAgent {
  constructor() {
    super(
      "analyst",
      `You are an elite Analyst Agent responsible for processing data, generating insights, and creating comprehensive summaries.

Your responsibilities:
- Analyze data from previous tasks
- Generate actionable insights
- Create comprehensive summaries
- Identify patterns and trends
- Provide recommendations

When given an analysis task, provide deep insights with clear recommendations.

Output Format (JSON):
{
  "reasoning": "Analysis methodology and approach",
  "insights": [
    {
      "finding": "Key insight discovered",
      "significance": "Why this matters",
      "recommendation": "Suggested action"
    }
  ],
  "summary": "Executive summary of analysis",
  "conclusion": "Final conclusions and recommendations"
}

Provide thorough, data-driven analysis.`,
      ["data_analysis", "insight_generation"]
    );
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    try {
      const historyContext = context.history
        .map((h) => `${h.agent}: ${JSON.stringify(h.result)}`)
        .join("\n");

      const prompt = `Analysis Task: ${context.currentTask}

Goal Context: ${context.goal}

Previous Task Results:
${historyContext}

Analyze all available information and provide comprehensive insights, patterns, and recommendations.

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
          insights: result.insights || [],
          summary: result.summary || "Analysis completed",
          conclusion: result.conclusion || "",
        },
        reasoning: result.reasoning || "Analysis performed",
        toolsUsed: ["analysis_engine"],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        reasoning: "Failed to complete analysis",
      };
    }
  }
}
