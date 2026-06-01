import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Demo from './Demo';
import MenuPage from './MenuPage';
import EmbedPage from './EmbedPage';
import StandalonePage from './StandalonePage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Demo />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/embed/:num" element={<EmbedPage />} />
        <Route path="/page/:num" element={<StandalonePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
