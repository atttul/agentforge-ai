import React, { useEffect, useState } from 'react';
import { projectApi } from '../../api/project.api';
import type { Project } from '../../types';
import { FolderKanban, Plus, Trash2, Bot, FileText } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjectsData = async () => {
    setLoading(true);
    try {
      const projRes = await projectApi.getUserProjects();
      if (projRes.data) setProjects(projRes.data);
    } catch (err) {
      console.error('Failed to fetch projects data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Project name is required');

    setCreating(true);
    try {
      await projectApi.createProject({
        name,
        description,
      });
      setName('');
      setDescription('');
      setShowModal(false);
      fetchProjectsData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project workspace?')) return;
    try {
      await projectApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete project workspace');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <FolderKanban className="text-emerald-400" />
            <span>Project Workspaces</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Group related AI Agents, Knowledge Documents, and Chat Executions into dedicated workspaces.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading workspaces...</div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/30">
          <FolderKanban size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No project workspaces</h3>
          <p className="text-xs text-slate-500 mt-1">Create a workspace to organize your agents and documents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    📁
                  </div>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-100">{project.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.description || 'Workspace'}</p>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Bot size={14} className="text-purple-400" />
                    <span>{project.agents?.length || 0} Agents linked</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <FileText size={14} className="text-indigo-400" />
                    <span>{project.documents?.length || 0} Documents linked</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Create Project Workspace</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Customer Support AI System"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short workspace description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
