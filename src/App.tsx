import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditorView from './views/EditorView';
import SharedView from './views/SharedView';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<EditorView />} />
            <Route path="/compare/:id" element={<SharedView />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
