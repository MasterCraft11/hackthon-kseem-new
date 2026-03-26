import React, { useState, useMemo } from 'react';
import { Flashcard } from './Flashcard';
import { FlashcardData, Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown, Info } from 'lucide-react';

interface FlashcardDeckProps {
  cards: FlashcardData[];
  onReview: (id: string, difficulty: Difficulty) => void;
  onFinish?: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, onReview, onFinish }) => {
  const [now] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter cards that are due for review using a stable timestamp for this session
  const dueCards = useMemo(() => cards.filter(card => card.nextReviewDate <= now), [cards, now]);

  if (dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 bg-accent-green/10 rounded-3xl flex items-center justify-center text-accent-green shadow-xl shadow-emerald-500/10"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <div className="space-y-3">
          <h3 className="font-headline text-3xl font-black text-on-surface">Session Complete!</h3>
          <p className="text-on-surface-variant font-medium">
            You've reviewed all your due cards. Great job staying consistent!
          </p>
        </div>
        <button 
          onClick={onFinish}
          className="primary-gradient px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

  const handleNext = () => {
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Session Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onFinish}
            className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black font-headline text-on-surface">Study Session</h2>
            <p className="text-sm text-on-surface-variant font-medium">Spaced Repetition Active</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Progress</p>
            <p className="text-lg font-black text-on-surface">{currentIndex + 1} / {dueCards.length}</p>
          </div>
          <div className="w-32 bg-surface-container-low h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="relative min-h-[450px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <Flashcard card={currentCard} onReview={onReview} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Session Controls */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-4 bg-surface-container-low text-on-surface-variant rounded-2xl hover:bg-surface-container hover:text-on-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Card"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-2 px-6 py-3 bg-surface-container-low rounded-2xl border border-white/5">
            <Info size={16} className="text-primary" />
            <span className="text-sm font-bold text-on-surface-variant">
              Press <kbd className="bg-surface-container px-1.5 py-0.5 rounded border border-white/10 text-[10px]">SPACE</kbd> to flip
            </span>
          </div>

          <button 
            onClick={handleNext}
            disabled={currentIndex === dueCards.length - 1}
            className="p-4 bg-surface-container-low text-on-surface-variant rounded-2xl hover:bg-surface-container hover:text-on-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Card"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onReview(currentCard.id, 'Hard')}
            className="flex items-center gap-2 px-6 py-3 bg-accent-red/10 text-accent-red rounded-xl font-bold hover:bg-accent-red/20 transition-all"
          >
            <ThumbsDown size={18} />
            Unknown
          </button>
          <button 
            onClick={() => onReview(currentCard.id, 'Easy')}
            className="flex items-center gap-2 px-6 py-3 bg-accent-green/10 text-accent-green rounded-xl font-bold hover:bg-accent-green/20 transition-all"
          >
            <ThumbsUp size={18} />
            Known
          </button>
        </div>
      </div>
    </div>
  );
};
