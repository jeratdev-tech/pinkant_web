import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from "./components/layout/Navigation";
import HomePage from "./components/home/HomePage";
import AuthPage from "./components/auth/AuthPage";
import ForumFeed from "./components/forum/ForumFeed";
import UserProfile from "./components/profile/UserProfile";
import WalletHome from "./features/wallet/WalletHome";
import AdminLayout from "./features/admin/AdminLayout";
import AddFunds from "./features/wallet/AddFunds";
import SendFunds from "./features/wallet/SendFunds";
import Withdraw from "./features/wallet/Withdraw";
import Transactions from "./features/wallet/Transactions";
import DMList from "./features/dm/DMList";
import DMThread from "./features/dm/DMThread";
import Onboarding from "./features/auth/Onboarding";
import Toasts from "./components/Toasts";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}

// Main App Layout
function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route path="/forum" element={<ForumFeed />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Settings
                  </h1>
                  <div className="card">
                    <p className="text-gray-600">
                      Settings page coming soon...
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet/add"
            element={
              <ProtectedRoute>
                <AddFunds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet/send"
            element={
              <ProtectedRoute>
                <SendFunds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dm"
            element={
              <ProtectedRoute>
                <DMList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dm/:id"
            element={
              <ProtectedRoute>
                <DMThread />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Root App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
        <Toasts />
      </AuthProvider>
    </Router>
  );
}

export default App;
