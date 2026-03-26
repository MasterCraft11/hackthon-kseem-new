import React from 'react';
import { 
  HelpCircle, 
  RotateCcw, 
  TrendingDown as LucideTrendingDown, 
  ThumbsUp, 
  Zap 
} from 'lucide-react';

export const QuizIcon = ({ size = 24, className }: { size?: number; className?: string }) => <HelpCircle size={size} className={className} />;
export const Replay = ({ size = 24, className }: { size?: number; className?: string }) => <RotateCcw size={size} className={className} />;
export const TrendingDown = ({ size = 24, className }: { size?: number; className?: string }) => <LucideTrendingDown size={size} className={className} />;
export const ThumbUp = ({ size = 24, className }: { size?: number; className?: string }) => <ThumbsUp size={size} className={className} />;
export const Bolt = ({ size = 24, className }: { size?: number; className?: string }) => <Zap size={size} className={className} />;
