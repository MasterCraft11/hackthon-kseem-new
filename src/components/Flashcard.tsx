import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizIcon } from './Icons'; // We'll define a simple icon component
import { FlashcardData, Difficulty } from '../types';
import { Replay, TrendingDown, ThumbUp, Bolt } from './Icons'; // More icons

interface FlashcardProps {
  card: FlashcardData;
  onReview: (id: string, difficulty: Difficulty) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, onReview }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e?: React.MouseEvent) => {
    // Prevent flip if clicking buttons
    if (e && (e.target as HTMLElement).closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  // Keyboard support for flipping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped]);

  return (
    <div className="flex flex-col items-center space-y-10 w-full max-w-2xl mx-auto">
      {/* The Flashcard */}
      <motion.div 
        className="w-full aspect-[1.6/1] perspective-1000 cursor-pointer group relative"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20
          }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden glass-card rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <QuizIcon size={32} />
              </div>
              <h3 className="font-headline text-2xl md:text-4xl font-black leading-tight text-on-surface px-4">
                {card.question}
              </h3>
              <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-60">
                <span>Click or Space to reveal</span>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden bg-surface-container rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center text-center border-2 border-primary/20 rotate-y-180 shadow-2xl">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
                <QuizIcon size={32} />
              </div>
              <p className="text-lg md:text-2xl text-on-surface leading-relaxed font-medium px-4">
                {card.answer}
              </p>
              <div className="text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-60">
                <span>Click or Space to hide</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Difficulty Ratings (Only visible when flipped) */}
      <div className="h-24 w-full max-w-lg">
        <AnimatePresence mode="wait">
          {isFlipped && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="grid grid-cols-3 gap-4 w-full"
            >
              <button 
                onClick={() => onReview(card.id, 'Hard')}
                className="flex flex-col items-center gap-1 p-3 bg-surface-container-low border border-white/5 text-on-surface-variant rounded-2xl hover:bg-accent-red/10 hover:text-accent-red hover:border-accent-red/20 transition-all group"
              >
                <TrendingDown size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-tighter">Hard</span>
              </button>

              <button 
                onClick={() => onReview(card.id, 'Good')}
                className="flex flex-col items-center gap-1 p-3 bg-surface-container-low border border-white/5 text-on-surface-variant rounded-2xl hover:bg-accent-green/10 hover:text-accent-green hover:border-accent-green/20 transition-all group"
              >
                <ThumbUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-tighter">Good</span>
              </button>

              <button 
                onClick={() => onReview(card.id, 'Easy')}
                className="flex flex-col items-center gap-1 p-3 bg-surface-container-low border border-white/5 text-on-surface-variant rounded-2xl hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all group"
              >
                <Bolt size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-tighter">Easy</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
