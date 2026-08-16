'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    return <div className="fixed inset-0 z-50 bg-white p-8">No questions found for this exam.</div>;
  }

  const q = questions[currentIndex];
  const currentAnswer = answers[q.id];
  const isMarked = markedForReview.has(q.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-6 shrink-0 shadow-sm">
         <h1 className="font-bold text-lg text-indigo-600 truncate mr-4">{exam.title}</h1>
         
         <div className="flex items-center gap-6">
           <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
           </div>
           
           <Button onClick={handleManualSubmit} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
           </Button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
         {/* Question Area */}
         <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 relative">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Question {q.question_number}</h2>
                 <div className="flex gap-4 text-sm font-medium">
                   <span className="text-green-600">+{q.marks} Marks</span>
                   <span className="text-red-600">-{q.negative_marks} Marks</span>
                 </div>
              </div>

              <Card className="flex-1 mb-6 border-slate-200 shadow-sm">
                 <CardContent className="p-6 md:p-8">
                   <p className="text-lg whitespace-pre-wrap leading-relaxed mb-8">{q.question}</p>
                   
                   <div className="space-y-3">
                     {['A', 'B', 'C', 'D'].map((opt) => {
                       const optionText = q[`option_${opt.toLowerCase()}`];
                       if (!optionText) return null;
                       
                       const isSelected = currentAnswer === opt;
                       
                       return (
                         <label 
                           key={opt}
                           className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                             isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                           }`}
                         >
                           <input 
                             type="radio" 
                             name={`question-${q.id}`} 
                             value={opt}
                             checked={isSelected}
                             onChange={() => saveAnswer(q.id, opt)}
                             className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                           />
                           <div className="flex-1">
                             <span className="font-semibold mr-2">{opt}.</span>
                             <span>{optionText}</span>
                           </div>
                         </label>
                       );
                     })}
                   </div>
                 </CardContent>
              </Card>

              {/* Action Bar */}
              <div className="flex justify-between items-center pt-4 sticky bottom-0 bg-slate-50 pb-4">
                 <div className="flex gap-2">
                   <Button variant="outline" onClick={() => toggleReview(q.id)} className={isMarked ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' : ''}>
                      <Flag className="h-4 w-4 mr-2" /> {isMarked ? 'Unmark Review' : 'Mark for Review'}
                   </Button>
                   <Button variant="ghost" onClick={() => clearAnswer(q.id)} disabled={!currentAnswer}>
                      Clear Response
                   </Button>
                 </div>
                 
                 <div className="flex gap-2">
                   <Button variant="secondary" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                     <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                   </Button>
                   <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1}>
                     Next <ChevronRight className="h-4 w-4 ml-2" />
                   </Button>
                 </div>
              </div>
            </div>
         </div>

         {/* Right Sidebar - Palette */}
         <div className="w-80 bg-white border-l border-slate-200 flex flex-col hidden lg:flex shrink-0">
            <div className="p-4 border-b bg-slate-50">
               <h3 className="font-semibold mb-3">Question Palette</h3>
               <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center text-xs">{Object.keys(answers).length}</div> Answered</div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center text-xs bg-white text-slate-500">{questions.length - Object.keys(answers).length}</div> Unanswered</div>
                  <div className="flex items-center gap-2 mt-1"><div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center text-xs">{markedForReview.size}</div> Marked</div>
               </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
               <div className="grid grid-cols-5 gap-2">
                 {questions.map((question: any, idx: number) => {
                   const isAnswered = !!answers[question.id];
                   const isReview = markedForReview.has(question.id);
                   const isCurrent = currentIndex === idx;
                   
                   let bgClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-300 border-2";
                   if (isAnswered) bgClass = "bg-green-500 border-green-600 text-white";
                   if (isReview) bgClass = "bg-amber-500 border-amber-600 text-white";
                   
                   if (isAnswered && isReview) bgClass = "bg-purple-600 border-purple-700 text-white relative after:content-[''] after:absolute after:-bottom-1 after:-right-1 after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:border-2 after:border-white";
                   
                   if (isCurrent) {
                     bgClass += " ring-2 ring-indigo-600 ring-offset-2";
                   }

                   return (
                     <button
                       key={question.id}
                       onClick={() => setCurrentIndex(idx)}
                       className={`w-10 h-10 rounded font-medium flex items-center justify-center transition-all ${bgClass}`}
                     >
                       {question.question_number}
                     </button>
                   );
                 })}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
