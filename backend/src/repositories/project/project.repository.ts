import Project, { IProject } from "../../models/Project";

export class ProjectRepository {
  async createProject(data: Partial<IProject>): Promise<IProject> {
    return Project.create(data);
  }

  async findUserProjects(userId: string): Promise<IProject[]> {
    return Project.find({ userId })
      .populate("agents", "name model status")
      .populate("documents", "title chunksCount")
      .sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<IProject | null> {
    return Project.findById(id)
      .populate("agents")
      .populate("documents");
  }

  async updateProject(id: string, updateData: Partial<IProject>): Promise<IProject | null> {
    return Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("agents")
      .populate("documents");
  }

  async deleteProject(id: string): Promise<IProject | null> {
    return Project.findByIdAndDelete(id);
  }
}

export const projectRepository = new ProjectRepository();
