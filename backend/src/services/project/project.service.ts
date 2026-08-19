import { projectRepository } from "../../repositories/project/project.repository";
import { CreateProjectInput, UpdateProjectInput } from "../../schemas/project.schema";
import { ApiError } from "../../shared/ApiError";
import { StatusCodes } from "../../shared/StatusCodes";

export class ProjectService {
  async createProject(userId: string, payload: CreateProjectInput) {
    return projectRepository.createProject({
      ...payload,
      userId: userId as any,
      agents: (payload.agents || []) as any,
      documents: (payload.documents || []) as any,
    });
  }

  async getUserProjects(userId: string) {
    return projectRepository.findUserProjects(userId);
  }

  async getProjectById(id: string, userId: string) {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Project not found");
    }

    if (project.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied to project");
    }

    return project;
  }

  async updateProject(id: string, userId: string, payload: UpdateProjectInput) {
    await this.getProjectById(id, userId);
    return projectRepository.updateProject(id, payload as any);
  }

  async deleteProject(id: string, userId: string) {
    await this.getProjectById(id, userId);
    await projectRepository.deleteProject(id);
    return { message: "Project deleted successfully" };
  }
}

export const projectService = new ProjectService();
