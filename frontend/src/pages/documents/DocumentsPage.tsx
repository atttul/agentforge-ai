import React, { useEffect, useState } from 'react';
import { documentApi } from '../../api/document.api';
import type { Document } from '../../types';
import { FileText, Plus, Search, Trash2, Database, Cpu, CheckCircle2 } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Vector Search Test State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getUserDocuments();
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('Title and Content are required');

    setUploading(true);
    try {
      await documentApi.createDocument({ title, content });
      setTitle('');
      setContent('');
      setShowUploadModal(false);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to index document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete document and its Pinecone vector embeddings?')) return;
    try {
      await documentApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await documentApi.searchKnowledge(searchQuery, 3);
      if (res.data) setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <FileText className="text-indigo-400" />
            <span>Knowledge Base & Vector Store</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store documents, automatically chunk text, generate Gemini embeddings, and query Pinecone RAG vectors.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Upload & Index Document</span>
        </button>
      </div>

      {/* Vector Search Sandbox */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-3">
          <Database size={18} className="text-purple-400" />
          <span>Pinecone Vector Search Simulator</span>
        </h2>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question or enter text to find relevant document vector chunks..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {searching ? 'Querying...' : 'Query Vector Database'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold text-slate-300">Top Similarity Match Chunks:</h4>
            {searchResults.map((match, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-indigo-400 font-mono">
                  <span>Match #{idx + 1} • Vector ID: {match.id}</span>
                  {match.score && <span>Similarity Score: {(match.score * 100).toFixed(1)}%</span>}
                </div>
                <p className="text-slate-200">{match.metadata?.text || 'Text metadata chunk'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Indexed Documents</h2>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl p-6">
            <FileText size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">No documents indexed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-indigo-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-200 truncate">{doc.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{doc.content}</p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      <Cpu size={10} />
                      <span>{doc.chunksCount} Vector Chunks</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <CheckCircle2 size={10} />
                      <span>Pinecone Indexed</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Upload Knowledge Document</h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AgentForge Architecture & API Specification"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Raw Text Content</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste documentation, knowledge, instructions, or articles here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Chunking & Indexing...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
