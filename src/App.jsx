import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import NoteDetailPage from './pages/NoteDetailPage.jsx';
import SharedPage from './pages/SharedPage.jsx';
//import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import TeamDetailsPage from './pages/TeamDetailsPage.jsx';
import TeamPermissionsPage from './pages/TeamPermissionsPage.jsx';



function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAuth({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/Notes" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
          <Route path="shared" element={<SharedPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="audit" element={<AuditPage />} />

          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:teamId" element={<TeamDetailsPage />} />

        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

