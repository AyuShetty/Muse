
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Edit3, Type } from 'lucide-react';
import { motion } from 'framer-motion';



const EditPage = ({ project, setProject }) => {
  const navigate = useNavigate();

  const handleUpdate = (index, field, value) => {
    const newTimestamps = [...project.timestamps];
    newTimestamps[index][field] = parseFloat(value);
    setProject(prev => ({ ...prev, timestamps: newTimestamps }));
  };

  const handleStyleChange = (field, value) => {
    setProject(prev => ({
      ...prev,
      style: { ...prev.style, [field]: value }
    }));
  };


  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">Step 3 of 4</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Fine-tune & Style</h1>
        </div>
        <button onClick={() => navigate('/preview')} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">

          <div className="glass-card !p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Edit3 size={16} /> Timeline Adjustments
            </h3>
            <motion.div 
              className="space-y-3 max-h-[650px] overflow-y-auto pr-4 custom-scrollbar"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {project.timestamps.map((t, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all group"
                >
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={t.text} 
                      onChange={(e) => {
                        const newT = [...project.timestamps];
                        newT[i].text = e.target.value;
                        setProject(prev => ({ ...prev, timestamps: newT }));
                      }}
                      className="bg-transparent border-none focus:ring-0 p-0 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors w-full"
                    />
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Start</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={t.start}
                        onChange={(e) => handleUpdate(i, 'start', e.target.value)}
                        className="w-20 bg-white border border-slate-200 text-center text-xs h-9 rounded-lg font-bold text-slate-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">End</span>
                      <input 
                        type="number" 
                        step="0.1"
                        value={t.end}
                        onChange={(e) => handleUpdate(i, 'end', e.target.value)}
                        className="w-20 bg-white border border-slate-200 text-center text-xs h-9 rounded-lg font-bold text-slate-600"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card !p-8 sticky top-32">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <Type size={16} /> Style Settings
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Font Family</label>
                <select 
                  value={project.style.font}
                  onChange={(e) => handleStyleChange('font', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-700 font-medium"
                >
                  <option value="Arial">Arial</option>
                  <option value="Impact">Impact</option>
                  <option value="Pacifico">Pacifico</option>
                  <option value="Inter">Inter</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
                  Font Size <span>{project.style.fontSize}px</span>
                </label>
                <input 
                  type="range" 
                  min="24" max="120"
                  value={project.style.fontSize}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Lyric Color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {['#FFFFFF', '#000000', '#6366f1', '#ec4899', '#f59e0b', '#10b981'].map(color => (
                    <button 
                      key={color}
                      onClick={() => handleStyleChange('fontColor', color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${project.style.fontColor === color ? 'border-primary scale-110' : 'border-white'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={project.style.fontColor}
                    onChange={(e) => handleStyleChange('fontColor', e.target.value)}
                    className="w-7 h-7 p-0 border-none bg-transparent rounded-full overflow-hidden cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Screen Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {['top', 'center', 'bottom'].map(pos => (
                    <button 
                      key={pos}
                      onClick={() => handleStyleChange('position', pos)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all ${project.style.position === pos ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => navigate('/preview')}
                  className="btn btn-primary w-full shadow-lg shadow-indigo-100"
                >
                  <Save size={18} /> Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};


export default EditPage;
