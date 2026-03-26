import React, { useState, useEffect } from 'react';
import { UploadForm } from './components/UploadForm';
import { FlashcardDeck } from './components/FlashcardDeck';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { FlashcardData, Difficulty } from './types';
import { GoogleGenAI, Type } from "@google/genai";
import { getSupabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Settings, ArrowLeft, Sparkles } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'dashboard' | 'upload' | 'study'>('dashboard');
  const [configError, setConfigError] = useState<string | null>(null);

  // Handle Supabase Session
  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      console.warn('Supabase not configured:', err.message);
      setConfigError(err.message);
    }
  }, []);

  // Load cards from localStorage on mount (scoped by user if possible)
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const storageKey = `codecraft_cards_${session.user.id}`;
    const savedCards = localStorage.getItem(storageKey);
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    } else {
      setCards([]); // Clear cards if new user or no data
    }
  }, [session]);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (!session?.user?.id) return;
    const storageKey = `codecraft_cards_${session.user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(cards));
  }, [cards, session]);

  const handleLogout = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setSession(null);
    }
  };

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="bg-surface-container-lowest p-8 rounded-2xl surface-stack border border-red-900/30 max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center text-red-400 mx-auto">
            <Settings size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Configuration Required</h2>
          <p className="text-on-surface-variant text-sm">
            Supabase is not configured. Please set your <code className="bg-slate-800 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-slate-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in the environment variables.
          </p>
          <div className="p-4 bg-slate-900/50 rounded-xl text-xs text-left font-mono text-slate-400 break-all">
            {configError}
          </div>
          <button
            onClick={() => setConfigError(null)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
          >
            Try Demo Mode
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onMockLogin={(userEmail) => {
      setSession({
        user: { id: 'demo-user', email: userEmail } as any,
        access_token: 'demo-token',
        refresh_token: 'demo-token',
        expires_in: 3600,
        token_type: 'bearer'
      });
    }} />;
  }

  const generateFlashcards = async (text: string, fileData?: string, mimeType?: string) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const parts: any[] = [];
      
      if (fileData && mimeType) {
        parts.push({
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        });
      }

      parts.push({
        text: `Extract 5-10 most important educational facts from the provided content and format them into Question-and-Answer pairs. Return the response strictly as a JSON array of objects, where each object has a unique "id" (string), a "question" (string), and an "answer" (string). 
        
        ${text ? `Additional Context/Notes: ${text}` : "Please analyze the attached document."}`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ["id", "question", "answer"],
            },
          },
        },
      });

      const newCardsRaw = JSON.parse(response.text || "[]");
      const newCards: FlashcardData[] = newCardsRaw.map((c: any) => ({
        ...c,
        nextReviewDate: Date.now(), // Due immediately
        masteryLevel: 0,
      }));

      setCards((prev) => [...prev, ...newCards]);
      setView('study');
    } catch (error) {
      console.error("Gemini API Error:", error);
      alert('Error generating flashcards. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (id: string, difficulty: Difficulty) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;

        let interval = 0;
        let masteryDelta = 0;

        switch (difficulty) {
          case 'Hard':
            interval = 1 * 60 * 1000; // 1 minute
            masteryDelta = -5;
            break;
          case 'Good':
            interval = 10 * 60 * 1000; // 10 minutes
            masteryDelta = 10;
            break;
          case 'Easy':
            interval = 24 * 60 * 60 * 1000; // 24 hours
            masteryDelta = 25;
            break;
        }

        return {
          ...card,
          nextReviewDate: Date.now() + interval,
          masteryLevel: Math.min(100, Math.max(0, card.masteryLevel + masteryDelta)),
        };
      })
    );
  };

  return (
    <div className="min-h-screen flex bg-surface selection:bg-primary/30">
      <Sidebar 
        activeView={view} 
        onNavigate={setView} 
        onLogout={handleLogout}
        userEmail={session.user.email || 'Demo User'}
      />

      <main className="flex-1 lg:ml-72 p-6 md:p-10 lg:p-16 max-w-7xl mx-auto w-full transition-all duration-500">
        {view === 'dashboard' && (
          <Dashboard 
            cards={cards} 
            onStartStudy={() => setView('study')} 
            onNavigateToUpload={() => setView('upload')} 
          />
        )}
        
        {view === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </button>
                <div className="space-y-2">
                  <h1 className="text-5xl font-black font-headline text-on-surface tracking-tight leading-none flex items-center gap-4">
                    Create New Deck
                    <Sparkles className="text-primary animate-pulse" size={32} />
                  </h1>
                  <p className="text-on-surface-variant font-medium text-xl">Upload your study materials to generate AI flashcards.</p>
                </div>
              </div>
            </div>
            <UploadForm onGenerate={generateFlashcards} isLoading={isLoading} />
          </div>
        )}

        {view === 'study' && (
          <FlashcardDeck 
            cards={cards} 
            onReview={handleReview} 
            onFinish={() => setView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
