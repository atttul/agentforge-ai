import Agent, { AgentStatus, IAgent } from "../../models/Agent";

export class AgentRepository {
  async createAgent(agentData: Partial<IAgent>): Promise<IAgent> {
    return Agent.create(agentData);
  }

  async findUserAgents(userId: string): Promise<IAgent[]> {
    return Agent.find({ userId }).populate("knowledgeBases").sort({ updatedAt: -1 });
  }

  async findPublicAgents(): Promise<IAgent[]> {
    return Agent.find({ isPublic: true, status: AgentStatus.ACTIVE }).populate("knowledgeBases").sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<IAgent | null> {
    return Agent.findById(id).populate("knowledgeBases");
  }

  async updateAgent(id: string, updateData: Partial<IAgent>): Promise<IAgent | null> {
    return Agent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("knowledgeBases");
  }

  async deleteAgent(id: string): Promise<IAgent | null> {
    return Agent.findByIdAndDelete(id);
  }
}

export const agentRepository = new AgentRepository();
