import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext";
import ThreadList from "./pages/ThreadList";
import ThreadDetail from "./pages/ThreadDetail";
import CreateThread from "./pages/CreateThread";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Resources from "./pages/Resources";
import UploadResource from "./pages/UploadResource";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pb-16">
            <Routes>
              <Route path="/" element={<ThreadList />} />
              <Route path="/threads/:id" element={<ThreadDetail />} />
              <Route
                path="/threads/:id/edit"
                element={<ProtectedRoute><CreateThread /></ProtectedRoute>}
              />
              <Route path="/create" element={<ProtectedRoute><CreateThread /></ProtectedRoute>} />
              <Route path="/resources" element={<Resources />} />
              <Route
                path="/resources/upload"
                element={<ProtectedRoute><UploadResource /></ProtectedRoute>}
              />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
