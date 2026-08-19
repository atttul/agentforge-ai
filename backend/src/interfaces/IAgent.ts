export interface IAgentConfig {
  id?: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}
