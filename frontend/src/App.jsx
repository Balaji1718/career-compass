import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Skills from './pages/Skills.jsx';
import Careers from './pages/Careers.jsx';
import CareerDetail from './pages/CareerDetail.jsx';
import Analysis from './pages/Analysis.jsx';
import AnalysisDetail from './pages/AnalysisDetail.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Roadmaps from './pages/Roadmaps.jsx';
import RoadmapDetail from './pages/RoadmapDetail.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function guarded(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route path="/dashboard" element={guarded(<Dashboard />)} />
        <Route path="/profile" element={guarded(<Profile />)} />
        <Route path="/skills" element={guarded(<Skills />)} />
        <Route path="/careers" element={guarded(<Careers />)} />
        <Route path="/careers/:id" element={guarded(<CareerDetail />)} />
        <Route path="/analysis" element={guarded(<Analysis />)} />
        <Route path="/analysis/:id" element={guarded(<AnalysisDetail />)} />
        <Route path="/recommendations" element={guarded(<Recommendations />)} />
        <Route path="/roadmap" element={guarded(<Roadmaps />)} />
        <Route path="/roadmap/:id" element={guarded(<RoadmapDetail />)} />
        <Route path="/history" element={guarded(<History />)} />
        <Route path="/settings" element={guarded(<Settings />)} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
