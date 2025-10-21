import OpenAI from "openai";
import type { AgentType } from "@shared/schema";

// Reference: javascript_openai blueprint
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export interface AgentContext {
  goal: string;
  history: Array<{ agent: AgentType; action: string; result: any }>;
  currentTask?: string;
  availableTools: string[];
}

export interface AgentResult {
  success: boolean;
  result?: any;
  error?: string;
  reasoning?: string;
  toolsUsed?: string[];
}

export abstract class BaseAgent {
  protected name: AgentType;
  protected systemPrompt: string;
  protected tools: string[];

  constructor(name: AgentType, systemPrompt: string, tools: string[] = []) {
    this.name = name;
    this.systemPrompt = systemPrompt;
    this.tools = tools;
  }

  abstract execute(context: AgentContext): Promise<AgentResult>;

  protected async callLLM(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options: Partial<OpenAI.Chat.ChatCompletionCreateParams> = {}
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: this.systemPrompt },
          ...messages,
        ],
        max_completion_tokens: 8192,
        ...options,
      });

      return response.choices[0].message.content || "";
    } catch (error: any) {
      throw new Error(`LLM call failed: ${error.message}`);
    }
  }

  protected async callLLMWithFunctions(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    functions: OpenAI.Chat.ChatCompletionCreateParams.Function[],
    options: Partial<OpenAI.Chat.ChatCompletionCreateParams> = {}
  ): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: this.systemPrompt },
          ...messages,
        ],
        functions,
        function_call: "auto",
        max_completion_tokens: 8192,
        ...options,
      });
      return response as OpenAI.Chat.ChatCompletion;
    } catch (error: any) {
      throw new Error(`LLM function call failed: ${error.message}`);
    }
  }

  getName(): AgentType {
    return this.name;
  }

  getTools(): string[] {
    return this.tools;
  }
}
