import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Loader2, PlayCircle, Share2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';


const ResultPage = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!project.audioFile || !project.videoFile) {
      setError('Missing audio or video file. Please go back and upload them.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/create-video`, {
        background_video: project.videoFile.name,
        audio: project.audioFile.name,
        timestamps: project.timestamps,
        ...project.style
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      setError('Failed to generate video. Ensure FFmpeg is installed on the server.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fade-in max-w-4xl mx-auto text-center">
      {!videoUrl ? (
        <div className="glass-card py-20 bg-white border-slate-100">
          <div className="mb-10 relative inline-block">
            <div className="w-32 h-32 rounded-3xl bg-indigo-50 flex items-center justify-center animate-pulse">
              <PlayCircle size={64} className="text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center border-4 border-white">
              <CheckCircle2 size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight text-slate-900">Ready to Export</h1>
          <p className="text-slate-500 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">
            Your project is fully synced and styled. We're ready to render your high-quality video.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-8 max-w-md mx-auto text-left text-sm flex items-start gap-3 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <button 
              disabled={loading}
              onClick={handleGenerate}
              className="btn btn-primary btn-lg px-20 py-5 text-xl shadow-2xl shadow-indigo-200 font-black"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Rendering...
                </>
              ) : (
                'Start Production'
              )}
            </button>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Estimated time: 30 seconds</p>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="glass-card py-24 bg-gradient-to-b from-teal-50 to-white border-teal-100">
            <div className="mb-10 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-100">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight text-slate-900">It's Ready!</h1>
            <p className="text-slate-500 text-xl mb-12 font-medium">Your professional lyric video has been generated successfully.</p>
            
            <div className="flex gap-4 justify-center">
              <a 
                href={videoUrl} 
                download={`lyric_video_${project.audioFile.name.split('.')[0]}.mp4`}
                className="btn btn-primary px-12 py-4 shadow-xl shadow-indigo-100 text-lg font-bold"
              >
                <Download size={24} /> Download Video
              </a>
              <button className="btn btn-secondary px-10 py-4 font-bold border-slate-200">
                <Share2 size={22} /> Share Project
              </button>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="mt-10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Create New Project <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );

};


export default ResultPage;
