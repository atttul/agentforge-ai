import { Request, Response, NextFunction } from "express";
import { agentService } from "../../services/agent/agent.service";
import { sendSuccess } from "../../utils/response";
import { StatusCodes } from "../../shared/StatusCodes";

const getParamId = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class AgentController {
  async createAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await agentService.createAgent(req.user!._id.toString(), req.body);
      sendSuccess(res, "Agent created successfully", agent, StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getUserAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await agentService.getUserAgents(req.user!._id.toString());
      sendSuccess(res, "User agents retrieved successfully", agents, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getPublicAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await agentService.getPublicAgents();
      sendSuccess(res, "Public agents retrieved successfully", agents, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAgentById(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await agentService.getAgentById(getParamId(req), req.user!._id.toString());
      sendSuccess(res, "Agent retrieved successfully", agent, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await agentService.updateAgent(
        getParamId(req),
        req.user!._id.toString(),
        req.body
      );
      sendSuccess(res, "Agent updated successfully", agent, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await agentService.deleteAgent(getParamId(req), req.user!._id.toString());
      sendSuccess(res, result.message, null, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async executeAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;
      const result = await agentService.executeAgentDirect(
        getParamId(req),
        req.user!._id.toString(),
        prompt
      );
      sendSuccess(res, "Agent execution completed", result, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const agentController = new AgentController();
