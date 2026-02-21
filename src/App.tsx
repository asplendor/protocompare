import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditorView from './views/EditorView';
import SharedView from './views/SharedView';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorView />} />
        <Route path="/compare/:id" element={<SharedView />} />
      </Routes>
    </BrowserRouter>
  );
}
