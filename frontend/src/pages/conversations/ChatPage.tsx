import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { conversationApi } from '../../api/conversation.api';
import { agentApi } from '../../api/agent.api';
import type { Conversation, Agent, Message } from '../../types';
import { MessageSquare, Plus, Send, Bot, User as UserIcon, Sparkles, Database, Trash2, AlertCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('id');
  const queryAgentId = searchParams.get('agentId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Form & Error State
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [sending, setSending] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load user conversations and agents
  useEffect(() => {
    const initData = async () => {
      try {
        const [convRes, agentRes] = await Promise.all([
          conversationApi.getUserConversations(),
          agentApi.getUserAgents(),
        ]);

        if (agentRes.data) {
          setAgents(agentRes.data);
          if (queryAgentId) {
            setSelectedAgentId(queryAgentId);
          } else if (agentRes.data.length > 0) {
            setSelectedAgentId(agentRes.data[0]._id);
          }
        }

        if (convRes.data) {
          setConversations(convRes.data);
          if (activeConvId) {
            loadConversation(activeConvId);
          } else if (convRes.data.length > 0) {
            loadConversation(convRes.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load chat data', err);
      }
    };

    initData();
  }, [activeConvId, queryAgentId]);

  const loadConversation = async (id: string) => {
    setChatError(null);
    try {
      const res = await conversationApi.getConversationById(id);
      if (res.data) {
        setCurrentConversation(res.data);
        setMessages(res.data.messages || []);
        setSearchParams({ id });
      }
    } catch (err: any) {
      setChatError(err.response?.data?.message || 'Failed to load conversation details');
    }
  };

  const handleStartNewSession = async () => {
    if (!selectedAgentId) return alert('Please select an AI Agent first');
    setStartingSession(true);
    setChatError(null);

    try {
      const agentObj = agents.find((a) => a._id === selectedAgentId);
      const res = await conversationApi.startConversation({
        agentId: selectedAgentId,
        title: `Chat with ${agentObj?.name || 'Agent'}`,
      });

      const responsePayload: any = res.data || res;
      const conversationObj = responsePayload?.conversation || responsePayload;

      if (conversationObj?._id) {
        setConversations((prev) => [conversationObj, ...prev]);
        setCurrentConversation(conversationObj);
        setMessages(conversationObj.messages || []);
        setSearchParams({ id: conversationObj._id });
      }
    } catch (err: any) {
      setChatError(err.response?.data?.message || 'Failed to start conversation session');
    } finally {
      setStartingSession(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation || sending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setChatError(null);

    // Optimistically push user message to UI
    const tempUserMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await conversationApi.sendMessage(currentConversation._id, userText);
      const responsePayload: any = res.data || res;
      const conversationObj = responsePayload?.conversation;
      const replyText = responsePayload?.reply;

      if (conversationObj?.messages && conversationObj.messages.length > 0) {
        setMessages(conversationObj.messages);
      } else if (replyText) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to get response from AI agent';
      setChatError(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat session history?')) return;
    try {
      await conversationApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (currentConversation?._id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      alert('Failed to delete chat session');
    }
  };

  const activeAgent = (currentConversation?.agentId as Agent) || agents.find((a) => a._id === selectedAgentId);

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 overflow-hidden">
      {/* Session Sidebar */}
      <div className="w-80 shrink-0 border border-slate-800 bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Select AI Agent</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            >
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.model})
                </option>
              ))}
            </select>

            <button
              onClick={handleStartNewSession}
              disabled={startingSession || !selectedAgentId}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{startingSession ? 'Starting...' : 'New Chat Session'}</span>
            </button>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 px-1">Session History</h3>
            <div className="space-y-1.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    currentConversation?._id === conv._id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 border border-slate-800 bg-slate-900/60 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
        {currentConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{currentConversation.title}</h2>
                  <p className="text-[10px] text-slate-400 flex items-center space-x-2">
                    <span>Model: {activeAgent?.model || 'openrouter/free'}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Database size={10} />
                      <span>Pinecone RAG Active</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Session started. Type a prompt below to execute the AI agent.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>

                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {sending && (
                <div className="flex items-center space-x-2 text-xs text-purple-400 font-mono animate-pulse">
                  <Sparkles size={14} />
                  <span>Agent is executing OpenRouter LLM & Pinecone RAG search...</span>
                </div>
              )}

              {chatError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask or command your AI agent..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare size={48} className="text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Active Chat Session</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Select an AI agent from the sidebar and click "New Chat Session" to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
