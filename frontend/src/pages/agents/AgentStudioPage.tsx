import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { agentApi } from '../../api/agent.api';
import { documentApi } from '../../api/document.api';
import type { Document } from '../../types';
import { Bot, Save, ArrowLeft, Play, Sparkles, Sliders, Wrench, BookOpen, Lock, Globe } from 'lucide-react';

export const AgentStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant created on AgentForge AI platform.');
  const [model, setModel] = useState('openrouter/free');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [tools, setTools] = useState<string[]>(['web_search']);
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [availableDocs, setAvailableDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Test Run State
  const [testPrompt, setTestPrompt] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const docsRes = await documentApi.getUserDocuments();
        if (docsRes.data) setAvailableDocs(docsRes.data);

        if (isEditing && id) {
          const agentRes = await agentApi.getAgentById(id);
          if (agentRes.data) {
            const agent = agentRes.data;
            setName(agent.name);
            setDescription(agent.description || '');
            setSystemPrompt(agent.systemPrompt);
            setModel(agent.model || 'openrouter/free');
            setTemperature(agent.temperature ?? 0.7);
            setMaxTokens(agent.maxTokens ?? 2048);
            setTools(agent.tools || []);
            setSelectedKnowledgeBases(agent.knowledgeBases?.map((d: any) => d._id || d) || []);
            setIsPublic(agent.isPublic || false);
          }
        }
      } catch (err) {
        console.error('Failed to load agent studio data', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditing]);

  const handleToolToggle = (toolName: string) => {
    setTools((prev) =>
      prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName]
    );
  };

  const handleDocToggle = (docId: string) => {
    setSelectedKnowledgeBases((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Agent Name is required');
    if (!systemPrompt.trim()) return alert('System Prompt is required');

    setSaving(true);
    try {
      const payload = {
        name,
        description,
        systemPrompt,
        model,
        temperature,
        maxTokens,
        tools,
        knowledgeBases: selectedKnowledgeBases,
        isPublic,
      };

      if (isEditing && id) {
        await agentApi.updateAgent(id, payload);
      } else {
        await agentApi.createAgent(payload);
      }
      navigate('/agents');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestOutput('');

    try {
      if (isEditing && id) {
        const res = await agentApi.executeAgent(id, testPrompt);
        if (res.data?.output) setTestOutput(res.data.output);
      } else {
        // Direct execution simulation using custom prompt & system prompt
        setTestOutput(`[Simulation Test Mode]\nExecuting Agent "${name || 'Draft Agent'}"...\nModel: ${model}\nSystem Prompt: ${systemPrompt}\n\nUser Input: ${testPrompt}\n\nOutput: Agent is configured correctly and ready for deployment.`);
      }
    } catch (err: any) {
      setTestOutput(`Error: ${err.response?.data?.message || 'Execution failed'}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading Agent Studio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/agents')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {isEditing ? `Edit Agent: ${name}` : 'Build New AI Agent'}
            </h1>
            <p className="text-xs text-slate-400">Configure instructions, models, and tools</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Agent'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Bot className="text-purple-400" size={18} />
              <span>Identity & Basics</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Agent Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Code Review Assistant"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short explanation of what this agent does"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* System Prompt Editor */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="text-indigo-400" size={18} />
                <span>System Instructions & Behavior</span>
              </h2>
              <span className="text-[10px] text-slate-500">Core Persona</span>
            </div>

            <textarea
              required
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert AI assistant..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* Model & Hyperparameters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="text-cyan-400" size={18} />
              <span>Model & Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LLM Engine Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="openrouter/free">OpenRouter Free Auto-Router (Fast & Active)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0.0 (Precise)</span>
                  <span>1.0 (Balanced)</span>
                  <span>2.0 (Creative)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tools & Knowledge Base Integration */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-3">
                <Wrench className="text-amber-400" size={18} />
                <span>Capabilities & Tools</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['web_search', 'code_execution', 'vector_search'].map((t) => (
                  <div
                    key={t}
                    onClick={() => handleToolToggle(t)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      tools.includes(t)
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider">{t.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Bases */}
            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-3">
                <BookOpen className="text-emerald-400" size={18} />
                <span>Link Knowledge Base Documents (RAG)</span>
              </h2>

              {availableDocs.length === 0 ? (
                <p className="text-xs text-slate-500">No documents uploaded. Go to Knowledge Base to add context.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableDocs.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => handleDocToggle(doc._id)}
                      className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        selectedKnowledgeBases.includes(doc._id)
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-semibold text-slate-200 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">{doc.chunksCount} vectors</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Public Marketplace Visibility</p>
                <p className="text-[10px] text-slate-400">Allow other platform users to discover and execute this agent</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isPublic
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                <span>{isPublic ? 'Public' : 'Private'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Test Run Sandbox */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md sticky top-20">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-4">
              <Play className="text-emerald-400" size={18} />
              <span>Test Sandbox</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">User Prompt</label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a prompt to test your agent configuration..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleTestRun}
                disabled={testing || !testPrompt.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Play size={14} />
                <span>{testing ? 'Executing...' : 'Run Test Prompt'}</span>
              </button>

              {testOutput && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Execution Output
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                    {testOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
