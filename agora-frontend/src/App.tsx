import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext";
import ThreadList from "./pages/ThreadList";
import ThreadDetail from "./pages/ThreadDetail";
import CreateThread from "./pages/CreateThread";
import Register from "./pages/Register"
import Login from "./pages/Login";
import Navbar from "./components/Navbar";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<ThreadList />} />
          <Route path="/threads/:id" element={<ThreadDetail />} />
          <Route path="/create" element={<CreateThread />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;