import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, X, PlusCircle } from 'lucide-react';

interface UploadFormProps {
  onGenerate: (text: string, fileData?: string, mimeType?: string) => Promise<void>;
  isLoading: boolean;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain') {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF or TXT file.');
      }
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || file) {
      let fileData = undefined;
      let mimeType = undefined;

      if (file) {
        fileData = await readFileAsBase64(file);
        mimeType = file.type;
      }

      onGenerate(text, fileData, mimeType);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div 
          className={`w-full p-16 glass-card border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center space-y-6 transition-all group ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/5 hover:border-primary/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/10">
                <Upload size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-2xl font-black text-on-surface">Drop your notes here</h3>
                <p className="text-on-surface-variant font-medium">PDF, TXT, or MD supported (Max 25MB)</p>
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-surface-container-low hover:bg-surface-container text-on-surface font-bold rounded-xl transition-all border border-white/5"
              >
                Browse Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.txt" 
                onChange={handleFileChange}
              />
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-indigo-500/10">
                <FileText size={40} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-xl text-on-surface">{file.name}</p>
                <p className="text-on-surface-variant font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-red/10 text-accent-red rounded-lg font-bold hover:bg-accent-red/20 transition-all"
              >
                <X size={16} />
                Remove File
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Additional Context</label>
          <textarea
            className="w-full h-40 p-6 bg-surface-container-low border border-white/5 rounded-3xl focus:ring-2 focus:ring-primary/20 outline-none text-on-surface placeholder-on-surface-variant/30 resize-none font-medium transition-all"
            placeholder="Paste extra notes or specific instructions for the AI..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !file)}
            className="px-12 py-4 primary-gradient text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Generating...
              </>
            ) : (
              <>
                <PlusCircle size={24} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
