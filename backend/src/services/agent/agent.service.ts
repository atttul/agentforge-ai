import mongoose from "mongoose";
import { agentRepository } from "../../repositories/agent/agent.repository";
import { CreateAgentInput, UpdateAgentInput } from "../../schemas/agent.schema";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";
import { geminiService } from "../ai/gemini.service";

export class AgentService {
  async createAgent(userId: string, payload: CreateAgentInput) {
    const knowledgeBases = (payload.knowledgeBases || []).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    return agentRepository.createAgent({
      ...payload,
      userId: new mongoose.Types.ObjectId(userId) as any,
      knowledgeBases: knowledgeBases as any,
    });
  }

  async getUserAgents(userId: string) {
    return agentRepository.findUserAgents(userId);
  }

  async getPublicAgents() {
    return agentRepository.findPublicAgents();
  }

  async getAgentById(id: string, userId: string) {
    const agent = await agentRepository.findById(id);

    if (!agent) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Agent not found");
    }

    if (!agent.isPublic && agent.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied to this agent");
    }

    return agent;
  }

  async updateAgent(id: string, userId: string, payload: UpdateAgentInput) {
    const agent = await agentRepository.findById(id);

    if (!agent) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Agent not found");
    }

    if (agent.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You do not own this agent");
    }

    const updateData: any = { ...payload };
    if (payload.knowledgeBases) {
      updateData.knowledgeBases = payload.knowledgeBases.map(
        (kbId) => new mongoose.Types.ObjectId(kbId)
      );
    }

    return agentRepository.updateAgent(id, updateData);
  }

  async deleteAgent(id: string, userId: string) {
    const agent = await agentRepository.findById(id);

    if (!agent) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Agent not found");
    }

    if (agent.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You do not own this agent");
    }

    await agentRepository.deleteAgent(id);
    return { message: "Agent deleted successfully" };
  }

  async executeAgentDirect(id: string, userId: string, prompt: string) {
    const agent = await this.getAgentById(id, userId);

    const responseText = await geminiService.generateText(
      prompt,
      agent.systemPrompt,
      agent.model,
      agent.temperature
    );

    return {
      agentId: agent._id,
      agentName: agent.name,
      prompt,
      output: responseText,
      executedAt: new Date(),
    };
  }
}

export const agentService = new AgentService();
