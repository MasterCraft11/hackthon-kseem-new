import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Flame, Target, Clock, Plus, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { FlashcardData } from '../types';

interface DashboardProps {
  cards: FlashcardData[];
  onStartStudy: () => void;
  onNavigateToUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cards, onStartStudy, onNavigateToUpload }) => {
  const dueCards = cards.filter(c => c.nextReviewDate <= Date.now());
  const masteryAverage = cards.length > 0 
    ? Math.round(cards.reduce((acc, c) => acc + c.masteryLevel, 0) / cards.length) 
    : 0;

  const stats = [
    { label: 'Streak', value: '5 Days', icon: <Flame className="text-accent-orange" />, color: 'bg-accent-orange/10' },
    { label: 'Mastery', value: `${masteryAverage}%`, icon: <Target className="text-accent-green" />, color: 'bg-accent-green/10' },
    { label: 'Due Today', value: dueCards.length, icon: <Clock className="text-primary" />, color: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Welcome back!</h1>
          <p className="text-on-surface-variant font-medium">Ready to master something new today?</p>
        </div>
        <button 
          onClick={onNavigateToUpload}
          className="flex items-center gap-2 primary-gradient px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          Create New Deck
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-on-surface">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Decks Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline text-on-surface flex items-center gap-2">
              <LayoutGrid size={20} className="text-primary" />
              Your Decks
            </h2>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-2xl cursor-pointer group relative overflow-hidden"
                onClick={onStartStudy}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {cards.length} Cards
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Generated Study Deck</h3>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                  Comprehensive review of your uploaded materials.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">Mastery</span>
                    <span className="text-on-surface">{masteryAverage}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryAverage}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-green flex items-center gap-1">
                    <Clock size={12} />
                    {dueCards.length} due today
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-on-surface">No decks yet</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">
                Upload a document or paste some text to generate your first AI-powered study deck.
              </p>
              <button 
                onClick={onNavigateToUpload}
                className="text-primary font-bold hover:underline inline-flex items-center gap-2"
              >
                Get started <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Column: Recent Activity & Gamification */}
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold font-headline text-on-surface flex items-center gap-2">
              <List size={20} className="text-accent-orange" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Completed Study Session</p>
                    <p className="text-xs text-on-surface-variant">2 hours ago • 15 cards reviewed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="primary-gradient p-6 rounded-2xl text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-lg font-bold font-headline">Weekly Goal</h3>
            <p className="text-indigo-100 text-sm">You're on track! Complete 3 more sessions to reach your goal.</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>70% Complete</span>
                <span>7/10 Sessions</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[70%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
