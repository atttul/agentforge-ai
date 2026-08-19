import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AgentListPage } from './pages/agents/AgentListPage';
import { AgentStudioPage } from './pages/agents/AgentStudioPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { ChatPage } from './pages/conversations/ChatPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Platform Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentListPage />} />
          <Route path="/agents/new" element={<AgentStudioPage />} />
          <Route path="/agents/edit/:id" element={<AgentStudioPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/conversations" element={<ChatPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
