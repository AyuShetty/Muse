
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import EditPage from './pages/EditPage';
import ResultPage from './pages/ResultPage';
import { Layout } from './components/Layout';

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = ({ project, setProject }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><UploadPage project={project} setProject={setProject} /></AnimatedPage>} />
        <Route path="/preview" element={<AnimatedPage><PreviewPage project={project} setProject={setProject} /></AnimatedPage>} />
        <Route path="/edit" element={<AnimatedPage><EditPage project={project} setProject={setProject} /></AnimatedPage>} />
        <Route path="/result" element={<AnimatedPage><ResultPage project={project} /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [project, setProject] = useState({
    audioFile: null,
    videoFile: null,
    lyrics: '',
    timestamps: [],
    style: {
      font: 'Inter',
      fontSize: 64,
      fontColor: '#FFFFFF',
      position: 'center'
    }
  });

  return (
    <Router>
      <Layout>
        <AnimatedRoutes project={project} setProject={setProject} />
      </Layout>
    </Router>
  );
}

export default App;

