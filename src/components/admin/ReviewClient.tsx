'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deleteQuestionAction } from '@/app/admin/exams/actions';

export function ReviewClient({ examId, initialQuestions }: { examId: string, initialQuestions: any[] }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const q = questions[currentIndex];

  const handleUpdate = (field: string, value: any) => {
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], [field]: value };
    setQuestions(updated);
  };

  const handleSaveAndVerify = async () => {
    setSaving(true);
    const updatedQ = { ...q, verification_status: 'verified' };
    
    const { error } = await supabase.from('questions').update({
      question: updatedQ.question,
      option_a: updatedQ.option_a,
      option_b: updatedQ.option_b,
      option_c: updatedQ.option_c,
      option_d: updatedQ.option_d,
      correct_answer: updatedQ.correct_answer,
      explanation: updatedQ.explanation,
      marks: updatedQ.marks,
      negative_marks: updatedQ.negative_marks,
      verification_status: 'verified'
    }).eq('id', updatedQ.id);

    setSaving(false);

    if (!error) {
      const newQuestions = [...questions];
      newQuestions[currentIndex] = updatedQ;
      setQuestions(newQuestions);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        router.replace(`/admin/exams/${examId}`);
      }
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const approveAll = async () => {
    if (!confirm("Approve all currently pending questions?")) return;
    const { error } = await supabase.from('questions').update({ verification_status: 'verified' }).eq('exam_id', examId).eq('verification_status', 'pending');
    if (!error) {
      router.push(`/admin/exams/${examId}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question? This cannot be undone.")) return;
    setSaving(true);
    const result = await deleteQuestionAction(q.id, examId);
    setSaving(false);
    
    if (result.success) {
      const newQuestions = questions.filter((_, idx) => idx !== currentIndex);
      setQuestions(newQuestions);
      if (currentIndex >= newQuestions.length) {
        setCurrentIndex(Math.max(0, newQuestions.length - 1));
      }
    } else {
      alert("Error deleting: " + result.message);
    }
  };

  if (questions.length === 0) {
    return <div>No questions found for this exam.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-4 border rounded-lg h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-semibold">Questions ({questions.length})</h3>
           <Button variant="outline" size="sm" onClick={approveAll}>Approve All Pending</Button>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2 content-start">
          {questions.map((question, idx) => (
            <button
              key={question.id}
              onClick={() => setCurrentIndex(idx)}
              className={`p-2 border rounded text-sm flex items-center justify-center ${
                currentIndex === idx ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
              } ${question.verification_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
            >
              Q{question.question_number}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 border rounded-lg overflow-y-auto h-[600px] space-y-4 flex flex-col">
         <div className="flex justify-between items-center pb-4 border-b">
           <h3 className="font-bold text-lg">Question {q.question_number}</h3>
           <div className="flex items-center gap-4">
             {q.verification_status === 'verified' && <span className="flex items-center text-green-600 text-sm font-medium"><CheckCircle2 className="h-4 w-4 mr-1"/> Verified</span>}
             {q.verification_status === 'pending' && <span className="flex items-center text-amber-600 text-sm font-medium">Pending Review</span>}
             <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete Question" disabled={saving}>
               <Trash2 className="h-4 w-4 text-red-500" />
             </Button>
           </div>
         </div>
         
         <div className="space-y-4 flex-1">
           <div className="space-y-2">
             <Label>Question Text</Label>
             <Textarea value={q.question || ''} onChange={(e) => handleUpdate('question', e.target.value)} rows={4} />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Option A</Label>
               <Input value={q.option_a || ''} onChange={(e) => handleUpdate('option_a', e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Option B</Label>
               <Input value={q.option_b || ''} onChange={(e) => handleUpdate('option_b', e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Option C</Label>
               <Input value={q.option_c || ''} onChange={(e) => handleUpdate('option_c', e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Option D</Label>
               <Input value={q.option_d || ''} onChange={(e) => handleUpdate('option_d', e.target.value)} />
             </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label>Correct Answer</Label>
               <select 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-indigo-500"
                 value={q.correct_answer || ''} 
                 onChange={(e) => handleUpdate('correct_answer', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="A">A</option>
                 <option value="B">B</option>
                 <option value="C">C</option>
                 <option value="D">D</option>
               </select>
             </div>
             <div className="space-y-2">
               <Label>Marks</Label>
               <Input type="number" step="0.5" value={q.marks || 1} onChange={(e) => handleUpdate('marks', parseFloat(e.target.value))} />
             </div>
             <div className="space-y-2">
               <Label>Negative Marks</Label>
               <Input type="number" step="0.25" value={q.negative_marks || 0} onChange={(e) => handleUpdate('negative_marks', parseFloat(e.target.value))} />
             </div>
           </div>
           
           <div className="space-y-2">
             <Label>Explanation</Label>
             <Textarea value={q.explanation || ''} onChange={(e) => handleUpdate('explanation', e.target.value)} rows={2} />
           </div>
         </div>
         
         <div className="pt-4 border-t flex justify-between mt-auto">
           <Button variant="outline" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
             <ChevronLeft className="h-4 w-4 mr-2" /> Previous
           </Button>
           
           <Button onClick={handleSaveAndVerify} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
             {saving ? 'Saving...' : (
               <>
                 <CheckCircle2 className="h-4 w-4 mr-2" />
                 Save & Verify
               </>
             )}
           </Button>
           
           <Button variant="outline" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1}>
             Next <ChevronRight className="h-4 w-4 ml-2" />
           </Button>
         </div>
      </div>
    </div>
  );
}
