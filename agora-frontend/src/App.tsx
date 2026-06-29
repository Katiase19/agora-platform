import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThreadList from "./pages/ThreadList";
import ThreadDetail from "./pages/ThreadDetail";
import CreateThread from "./pages/CreateThread";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ThreadList />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
        <Route path="/create" element={<CreateThread />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;