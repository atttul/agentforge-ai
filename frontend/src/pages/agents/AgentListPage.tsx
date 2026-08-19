import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { agentApi } from '../../api/agent.api';
import type { Agent } from '../../types';
import { Bot, Plus, Search, Trash2, Edit3, Play, Globe, Lock } from 'lucide-react';

export const AgentListPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [publicAgents, setPublicAgents] = useState<Agent[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const [mineRes, publicRes] = await Promise.all([
        agentApi.getUserAgents(),
        agentApi.getPublicAgents(),
      ]);
      if (mineRes.data) setAgents(mineRes.data);
      if (publicRes.data) setPublicAgents(publicRes.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      await agentApi.deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert('Failed to delete agent');
    }
  };

  const displayedAgents = (activeTab === 'mine' ? agents : publicAgents).filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Bot className="text-purple-400" />
            <span>AI Agents Library</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build, configure, and deploy reusable AI agents with custom system prompts and tools.
          </p>
        </div>
        <Link
          to="/agents/new"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Create New Agent</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'mine'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Agents ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'public'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Public Marketplace ({publicAgents.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading agents...</div>
      ) : displayedAgents.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/30">
          <Bot size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No agents found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'mine'
              ? 'Get started by creating your first AI Agent.'
              : 'No public agents available in the marketplace.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAgents.map((agent) => (
            <div
              key={agent._id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl hover:border-purple-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {agent.isPublic ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                        <Globe size={10} />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">
                        <Lock size={10} />
                        <span>Private</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">
                  {agent.description || agent.systemPrompt}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded-md bg-slate-950 text-purple-300 border border-slate-800 text-[10px] font-mono">
                    {agent.model}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-[10px]">
                    Temp: {agent.temperature}
                  </span>
                  {agent.tools?.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/conversations?agentId=${agent._id}`)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 py-2 text-xs font-semibold transition-all mr-2"
                >
                  <Play size={14} />
                  <span>Execute Agent</span>
                </button>

                {activeTab === 'mine' && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => navigate(`/agents/edit/${agent._id}`)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Edit Agent"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(agent._id, e)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete Agent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
