'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LiveExamClient({ exam, attempt, questions, initialAnswers }: any) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const expiresAt = new Date(attempt.expires_at).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        handleAutoSubmit();
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt.expires_at]);

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    await fetch(`/api/exam/submit`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ attemptId: attempt.id })
    });
    
    router.replace(`/student/results/${attempt.id}`);
  }, [attempt.id, isSubmitting, router]);

  const handleManualSubmit = async () => {
    if (!confirm("Are you sure you want to submit? You cannot change your answers after submission.")) return;
    handleAutoSubmit();
  };

  const saveAnswer = async (questionId: string, answer: string) => {
    const updated = { ...answers, [questionId]: answer };
    setAnswers(updated);

    await supabase.from('attempt_answers').upsert({
      attempt_id: attempt.id,
      question_id: questionId,
      selected_answer: answer,
      updated_at: new Date().toISOString()
    }, { onConflict: 'attempt_id,question_id' });
  };

  const clearAnswer = async (questionId: string) => {
    const updated = { ...answers };
    delete updated[questionId];
    setAnswers(updated);
    
    await supabase.from('attempt_answers').update({
      selected_answer: null,
      updated_at: new Date().toISOString()
    }).eq('attempt_id', attempt.id).eq('question_id', questionId);
  };

  const toggleReview = (questionId: string) => {
    const newSet = new Set(markedForReview);
    if (newSet.has(questionId)) newSet.delete(questionId);
    else newSet.add(questionId);
    setMarkedForReview(newSet);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">No questions found for this exam.</div>;
  }

  const q = questions[currentIndex];
  const currentAnswer = answers[q.id];
  const isMarked = markedForReview.has(q.id);

  return (
    <div className="min-h-screen w-full bg-background text-foreground bg-mesh-animated flex flex-col font-sans relative z-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-20 bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-primary tracking-tight">Aspirants Q</span>
          <div className="hidden md:flex h-6 w-[1px] bg-border mx-2"></div>
          <h1 className="hidden md:block text-sm text-muted-foreground font-medium">{exam.title}</h1>
        </div>
        
        {/* Centered Timer */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 glass-panel px-6 py-2 rounded-full border border-white/40">
          <Clock className={`h-5 w-5 ${timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
          <span className={`text-xl font-bold tracking-wider ${timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <button 
          onClick={handleManualSubmit} 
          disabled={isSubmitting}
          className="bg-destructive text-destructive-foreground text-sm font-medium px-6 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md disabled:opacity-50"
        >
          <span className="hidden md:inline">{isSubmitting ? 'Submitting...' : 'Submit Exam'}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-24 px-4 md:px-12 flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left/Center: Exam Canvas */}
        <section className="flex-grow flex flex-col gap-6">
          {/* Question Container */}
          <div className="glass-panel rounded-3xl p-6 md:p-10 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                Question {q.question_number} of {questions.length}
              </span>
              <button 
                onClick={() => toggleReview(q.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isMarked ? 'text-amber-600' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Flag className="h-4 w-4" fill={isMarked ? 'currentColor' : 'none'} />
                {isMarked ? 'Flagged' : 'Flag for Review'}
              </button>
            </div>
            
            <div className="text-xl leading-relaxed text-foreground mb-10 whitespace-pre-wrap">
              {q.question}
            </div>
            
            {/* Options */}
            <div className="space-y-4 flex-grow">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = q[`option_${opt.toLowerCase()}`];
                if (!optionText) return null;
                
                const isSelected = currentAnswer === opt;
                
                return (
                  <label 
                    key={opt}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-white/40 hover:border-primary/30'
                    }`}
                  >
                    {!isSelected && <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                    
                    {/* Custom Radio Button */}
                    <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors shrink-0 ${
                      isSelected ? 'border-primary' : 'border-border group-hover:border-primary'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-primary transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    
                    <input 
                      className="hidden" 
                      name={`q-${q.id}`} 
                      type="radio" 
                      value={opt}
                      checked={isSelected}
                      onChange={() => saveAnswer(q.id, opt)}
                    />
                    
                    <span className={`relative text-lg ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {optionText}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-auto">
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
              disabled={currentIndex === 0}
              className="glass-panel px-8 py-3 rounded-full text-sm font-medium text-primary flex items-center gap-2 hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" /> Previous
            </button>
            <div className="flex gap-4">
               <button 
                  onClick={() => clearAnswer(q.id)} 
                  disabled={!currentAnswer}
                  className="px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Clear
               </button>
               <button 
                 onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} 
                 disabled={currentIndex === questions.length - 1}
                 className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
               >
                 Next <ChevronRight className="h-5 w-5" />
               </button>
            </div>
          </div>
        </section>

        {/* Right Side: Question Palette */}
        <aside className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 sticky top-28 h-[calc(100vh-120px)] max-md:static max-md:h-[400px]">
          <div className="glass-panel rounded-3xl p-6 flex flex-col h-full">
            <h2 className="text-xl font-medium text-foreground mb-6">Question Palette</h2>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium text-muted-foreground border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-border bg-white/50"></div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400"></div>
                <span>Flagged</span>
              </div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 pb-2 content-start flex-grow" style={{ scrollbarWidth: 'none' }}>
              {questions.map((question: any, idx: number) => {
                 const isAnswered = !!answers[question.id];
                 const isReview = markedForReview.has(question.id);
                 const isCurrent = currentIndex === idx;
                 
                 let bgClass = "bg-white/50 border border-border text-foreground hover:border-primary/50"; // Not visited
                 if (isAnswered) bgClass = "bg-primary/60 border-primary/20 text-primary-foreground";
                 if (isReview) bgClass = "bg-amber-100 border-amber-400 text-amber-700";
                 
                 if (isAnswered && isReview) {
                    bgClass = "bg-amber-100 border-amber-400 text-amber-700 relative after:content-[''] after:absolute after:-bottom-1 after:-right-1 after:w-3 after:h-3 after:bg-primary/80 after:rounded-full after:border after:border-white";
                 }
                 
                 if (isCurrent) {
                   bgClass += " ring-2 ring-primary ring-offset-2 ring-offset-transparent shadow-md font-bold scale-110";
                 }

                 return (
                   <button
                     key={question.id}
                     onClick={() => setCurrentIndex(idx)}
                     className={`w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${bgClass}`}
                   >
                     {question.question_number}
                   </button>
                 );
               })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
