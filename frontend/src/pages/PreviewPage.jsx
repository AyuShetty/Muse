
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Edit3, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const PreviewPage = ({ project, setProject }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (project.audioFile && waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(255, 255, 255, 0.1)',
        progressColor: '#38bdf8',
        cursorColor: '#38bdf8',
        barWidth: 3,
        barGap: 3,
        barRadius: 4,
        responsive: true,
        height: 80,
      });

      const url = URL.createObjectURL(project.audioFile);
      wavesurfer.current.load(url);

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime());
      });

      wavesurfer.current.on('play', () => setPlaying(true));
      wavesurfer.current.on('pause', () => setPlaying(false));

      return () => {
        wavesurfer.current.destroy();
        URL.revokeObjectURL(url);
      };
    }
  }, [project.audioFile]);

  const handlePlayPause = () => {
    wavesurfer.current.playPause();
  };

  const activeLyric = project.timestamps.find(
    t => currentTime >= t.start && currentTime <= t.end
  );


  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">Step 2 of 4</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Check Your Sync</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Edit My Files
        </button>
      </div>

      <div className="glass-card overflow-hidden !p-0 border-slate-200">
        <div className="bg-slate-900 aspect-video flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-indigo-500 to-transparent"></div>
          

          <div className="relative z-10 text-center px-12 w-full">
            <AnimatePresence mode="wait">
              {activeLyric ? (
                <motion.p 
                  key={activeLyric.text}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="text-4xl font-bold" 
                  style={{ 
                    color: project.style.fontColor, 
                    fontFamily: project.style.font,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  {activeLyric.text}
                </motion.p>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse [animation-delay:0.4s]"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          
          {/* Play Overlay */}
          {!playing && (
            <div 
              onClick={handlePlayPause}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 shadow-xl flex items-center justify-center">
                <Play size={40} className="text-primary fill-primary ml-1.5" />
              </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-white">
          <div className="flex items-center gap-4 mb-8">
             <button 
                onClick={handlePlayPause} 
                className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-indigo-200"
              >
                {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <div className="flex-1">
                <div ref={waveformRef} className="opacity-80"></div>
              </div>
              <div className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
              </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-slate-50">
            <button onClick={() => navigate('/edit')} className="btn btn-secondary px-8">
              <Edit3 size={18} /> Fine-tune Timing
            </button>
            <button onClick={() => navigate('/result')} className="btn btn-primary px-10">
              Looks Perfect <CheckCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};


export default PreviewPage;
