import { Request, Response, NextFunction } from "express";
import { projectService } from "../../services/project/project.service";
import { sendSuccess } from "../../utils/response";
import { StatusCodes } from "../../shared/StatusCodes";

const getParamId = (req: Request): string => {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
};

export class ProjectController {
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(
        req.user!._id.toString(),
        req.body
      );
      sendSuccess(res, "Project workspace created", project, StatusCodes.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getUserProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.getUserProjects(req.user!._id.toString());
      sendSuccess(res, "Projects retrieved", projects, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(
        getParamId(req),
        req.user!._id.toString()
      );
      sendSuccess(res, "Project details retrieved", project, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(
        getParamId(req),
        req.user!._id.toString(),
        req.body
      );
      sendSuccess(res, "Project updated successfully", project, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.deleteProject(
        getParamId(req),
        req.user!._id.toString()
      );
      sendSuccess(res, result.message, null, StatusCodes.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
