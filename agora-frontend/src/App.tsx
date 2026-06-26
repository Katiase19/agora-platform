import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThreadList from "./pages/ThreadList";
import ThreadDetail from "./pages/ThreadDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ThreadList />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;