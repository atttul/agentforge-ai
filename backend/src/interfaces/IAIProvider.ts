export interface IAIProvider {
  name: string;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}
