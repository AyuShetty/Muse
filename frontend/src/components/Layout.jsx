
import React from 'react';
import { Music2, Upload, Play, Edit3, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const StepIndicator = () => {
  const location = useLocation();
  const steps = [
    { path: '/', label: 'Upload', icon: Upload },
    { path: '/preview', label: 'Preview', icon: Play },
    { path: '/edit', label: 'Edit', icon: Edit3 },
    { path: '/result', label: 'Export', icon: Download },
  ];

  const currentIdx = steps.findIndex(s => s.path === location.pathname);

  return (
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        return (
          <div key={step.path} className={`step ${isActive ? 'active' : ''}`}>
            <div className="step-circle">
              <Icon size={14} />
            </div>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};


export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="py-6 px-8 mb-4 bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-100">
              <Music2 className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              LyricVideo<span className="text-primary">.ai</span>
            </span>
          </div>
          <nav className="flex gap-8 text-sm font-bold text-slate-500">
            <a href="/" className="hover:text-primary transition-all">Create</a>
            <a href="#" className="hover:text-primary transition-all">Library</a>
            <a href="#" className="hover:text-primary transition-all">Pricing</a>
          </nav>
        </div>
      </header>
      <main className="container flex-1 max-w-5xl mx-auto px-6 pb-16">
        <div className="mt-8">
          <StepIndicator />
        </div>
        {children}
      </main>
      <footer className="py-12 bg-white border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-300">
          <Music2 size={20} />
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <span className="font-black tracking-tighter text-slate-900">LyricVideo.ai</span>
        </div>
        <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
          &copy; 2026 Crafted with Passion for Creators
        </p>
      </footer>
    </div>
  );
};


