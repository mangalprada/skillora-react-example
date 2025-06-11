import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';

import Welcome from './pages/Welcome.jsx';
import AIInterview from './pages/AIInterview.jsx';
import MyInterview from './pages/MyInterview.jsx';

function App() {
  return (
    <>
      <Header />
      <main className="container mx-auto p-4 pt-24">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/my-interview" element={<MyInterview />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
