import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard } from '../components/common/StatCard';
import { agentApi } from '../api/agent.api';
import { documentApi } from '../api/document.api';
import { conversationApi } from '../api/conversation.api';
import { projectApi } from '../api/project.api';
import type { Agent, Document, Conversation, Project } from '../types';
import {
  Bot,
  FileText,
  MessageSquare,
  FolderKanban,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [agentsRes, docsRes, convsRes, projRes] = await Promise.all([
          agentApi.getUserAgents(),
          documentApi.getUserDocuments(),
          conversationApi.getUserConversations(),
          projectApi.getUserProjects(),
        ]);

        if (agentsRes.data) setAgents(agentsRes.data);
        if (docsRes.data) setDocuments(docsRes.data);
        if (convsRes.data) setConversations(convsRes.data);
        if (projRes.data) setProjects(projRes.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/20 p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs text-purple-300 mb-4">
            <Sparkles size={14} />
            <span>AI Agent Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 sm:text-4xl">
            Welcome to AgentForge AI
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Configure, manage, and execute autonomous AI agents powered by OpenRouter LLM & Pinecone Vector RAG.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/agents/new"
              className="inline-flex items-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all"
            >
              <Plus size={16} />
              <span>Create AI Agent</span>
            </Link>
            <Link
              to="/conversations"
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all"
            >
              <MessageSquare size={16} />
              <span>Open Execution Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active AI Agents"
          value={loading ? '...' : agents.length}
          icon={<Bot size={22} />}
          description="Configured Agent instances"
        />
        <StatCard
          title="Knowledge Documents"
          value={loading ? '...' : documents.length}
          icon={<FileText size={22} />}
          description="Indexed vector embeddings"
          color="from-indigo-600/20 to-cyan-600/20 border-indigo-500/30"
        />
        <StatCard
          title="Chat Sessions"
          value={loading ? '...' : conversations.length}
          icon={<MessageSquare size={22} />}
          description="Executed conversations"
          color="from-cyan-600/20 to-emerald-600/20 border-cyan-500/30"
        />
        <StatCard
          title="Projects"
          value={loading ? '...' : projects.length}
          icon={<FolderKanban size={22} />}
          description="Organized workspaces"
          color="from-emerald-600/20 to-purple-600/20 border-emerald-500/30"
        />
      </div>

      {/* Recent Agents & Chat Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Agents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot size={20} className="text-purple-400" />
              <h2 className="text-lg font-bold text-slate-100">Your AI Agents</h2>
            </div>
            <Link to="/agents" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading agents...</div>
          ) : agents.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400 mb-3">No AI agents created yet.</p>
              <Link
                to="/agents/new"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <Plus size={14} />
                <span>Build your first Agent</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 4).map((agent) => (
                <div
                  key={agent._id}
                  onClick={() => navigate(`/conversations?agentId=${agent._id}`)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{agent.description || agent.model}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} className="text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Recent Executions</h2>
            </div>
            <Link to="/conversations" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400 mb-3">No chat executions recorded.</p>
              <Link
                to="/conversations"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={14} />
                <span>Start a new session</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/conversations?id=${conv._id}`)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      💬
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {conv.messages?.length || 0} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
