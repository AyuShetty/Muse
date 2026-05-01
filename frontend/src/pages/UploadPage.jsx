
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Upload, FileAudio, FileVideo, Type, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';


const API_BASE = 'http://localhost:8000';

const ProcessingOverlay = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 6000),
      setTimeout(() => setStep(3), 12000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  const steps = [
    "Uploading audio file...",
    "Extracting vocals using AI...",
    "Transcribing and syncing lyrics...",
    "Finalizing timestamps..."
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto border-indigo-100 bg-white"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-indigo-100/50">
          <Wand2 size={40} className="text-primary animate-bounce" />
        </div>
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI is Working its Magic</h2>
      <div className="h-6 overflow-hidden mb-8 w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-slate-500 font-semibold text-lg"
          >
            {steps[step] || steps[steps.length - 1]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      <div className="w-full max-w-sm bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div 
          className="bg-primary h-2 rounded-full"
          initial={{ width: "10%" }}
          animate={{ width: `${(step + 1) * 25}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">This usually takes about 15-30 seconds</p>
    </motion.div>
  );
};

const UploadPage = ({ project, setProject }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setProject(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSync = async () => {
    if (!project.audioFile || !project.lyrics) {
      setError('Please upload an audio file and enter lyrics.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio_file', project.audioFile);
      formData.append('request', JSON.stringify({ 
        lyrics: project.lyrics.split('\n').filter(l => l.trim()),
        ...project.style
      }));

      const res = await axios.post(`${API_BASE}/sync-lyrics`, formData);
      setProject(prev => ({ ...prev, timestamps: res.data.timestamps }));
      
      if (project.videoFile) {
        const videoFormData = new FormData();
        videoFormData.append('file', project.videoFile);
        await axios.post(`${API_BASE}/upload-video`, videoFormData);
      }

      navigate('/preview');
    } catch (err) {
      console.error(err);
      setError('Failed to sync lyrics. Please check the backend connection.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-fade-in max-w-4xl mx-auto pt-10"><ProcessingOverlay /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
          Create Your <span className="text-primary">Lyric Video</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Turn your songs into beautiful visuals. Upload your assets below and we'll handle the rest using AI.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          {error}
        </div>
      )}

      <div className="grid gap-8">
        <div className="glass-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileAudio size={16} className="text-primary" /> Step 1: Upload Song
              </label>
              <div className="relative group h-36">
                <input 
                  type="file" 
                  accept=".mp3" 
                  onChange={(e) => handleFileChange(e, 'audioFile')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-2 ${project.audioFile ? 'border-primary bg-indigo-50' : 'border-slate-200 group-hover:border-primary/50 bg-slate-50/50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${project.audioFile ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                    <Upload size={20} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{project.audioFile ? project.audioFile.name : 'Select MP3 Audio'}</span>
                  <span className="text-[10px] text-slate-400">Drag & drop or click</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileVideo size={16} className="text-secondary" /> Step 2: Choose Background
              </label>
              <div className="relative group h-36">
                <input 
                  type="file" 
                  accept=".mp4" 
                  onChange={(e) => handleFileChange(e, 'videoFile')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-2 ${project.videoFile ? 'border-secondary bg-pink-50' : 'border-slate-200 group-hover:border-secondary/50 bg-slate-50/50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${project.videoFile ? 'bg-secondary text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                    <Upload size={20} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{project.videoFile ? project.videoFile.name : 'Select MP4 Video'}</span>
                  <span className="text-[10px] text-slate-400">Optional background</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Type size={16} className="text-accent" /> Step 3: Add Lyrics
            </label>
            <div className="relative">
              <textarea 
                rows={8}
                placeholder="Paste your lyrics here. Each line will appear on a new screen..."
                value={project.lyrics}
                onChange={(e) => setProject(prev => ({ ...prev, lyrics: e.target.value }))}
                className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-700 leading-relaxed shadow-inner"
              />
              <button 
                onClick={() => setProject(prev => ({ ...prev, lyrics: "Every morning I wake up\nFeeling ready to start the day\nThe sun is shining bright\nAnd everything will be okay" }))}
                className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-hover transition-colors bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm"
              >
                Load Example
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              disabled={loading || !project.audioFile || !project.lyrics}
              onClick={handleSync}
              className={`btn min-w-[300px] text-lg py-4 transition-all ${
                project.audioFile && project.lyrics 
                  ? 'btn-primary shadow-xl shadow-indigo-200' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              Sync Lyrics & Preview <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

