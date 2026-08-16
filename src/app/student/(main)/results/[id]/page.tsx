import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, Trophy, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function ResultsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: attempt } = await supabase.from('exam_attempts').select('*, exams(*)').eq('id', params.id).eq('student_id', user.id).single();

  if (!attempt) return notFound();

  if (attempt.status === 'in_progress') {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow-sm">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Exam Not Submitted</h2>
        <p className="text-muted-foreground mb-6">Your exam is still in progress. Please submit it to view results.</p>
        <Link href={`/student/exam/${attempt.exam_id}`}>
           <Button>Resume Exam</Button>
        </Link>
      </div>
    );
  }

  const { data: answers } = await supabase.from('attempt_answers').select('*, questions(*)').eq('attempt_id', attempt.id).order('question_number', { referencedTable: 'questions', ascending: true });

  const totalQuestions = attempt.exams.total_questions;
  const maxScore = attempt.exams.total_marks || (totalQuestions * attempt.exams.marks_per_question);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="flex items-center gap-4">
        <Link href="/student/dashboard">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground">{attempt.exams.title}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <Card className="md:col-span-1 border-indigo-100 bg-indigo-50/50">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
               <Trophy className="h-16 w-16 text-indigo-600 mb-4" />
               <div className="text-sm font-medium text-indigo-600 mb-1">Total Score</div>
               <div className="text-5xl font-black text-slate-900 mb-2">
                 {attempt.score} <span className="text-2xl text-slate-500 font-medium">/ {maxScore}</span>
               </div>
               <div className="text-sm text-slate-600 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
                 {attempt.percentage.toFixed(1)}%
               </div>
            </CardContent>
         </Card>

         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle>Performance Summary</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-slate-50 p-4 rounded-lg border text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">Questions</div>
                    <div className="text-2xl font-bold text-slate-900">{totalQuestions}</div>
                 </div>
                 <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">Correct</div>
                    <div className="text-2xl font-bold text-green-700">{attempt.correct_count}</div>
                 </div>
                 <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">Incorrect</div>
                    <div className="text-2xl font-bold text-red-700">{attempt.incorrect_count}</div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-sm font-medium text-slate-500 mb-1">Skipped</div>
                    <div className="text-2xl font-bold text-slate-700">{attempt.skipped_count}</div>
                 </div>
              </div>
           </CardContent>
         </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Detailed Review</h2>
        
        <div className="space-y-4">
           {answers?.sort((a, b) => a.questions.question_number - b.questions.question_number).map((ans, idx) => {
              const q = ans.questions;
              const isCorrect = ans.is_correct === true;
              const isWrong = ans.is_correct === false;
              const isSkipped = ans.is_correct === null;
              
              let borderClass = "border-slate-200";
              if (isCorrect) borderClass = "border-green-200 bg-green-50/30";
              if (isWrong) borderClass = "border-red-200 bg-red-50/30";

              return (
                <Card key={ans.id} className={borderClass}>
                  <CardHeader className="pb-3 border-b border-black/5 bg-black/5">
                    <div className="flex justify-between items-center">
                       <CardTitle className="text-base flex items-center gap-2">
                         Question {q.question_number}
                         {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                         {isWrong && <XCircle className="h-5 w-5 text-red-600" />}
                         {isSkipped && <MinusCircle className="h-5 w-5 text-slate-400" />}
                       </CardTitle>
                       <div className="text-sm font-medium">
                         <span className={isCorrect ? 'text-green-600' : isWrong ? 'text-red-600' : 'text-slate-500'}>
                           {ans.marks_awarded > 0 ? '+' : ''}{ans.marks_awarded || 0}
                         </span>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                     <p className="text-sm whitespace-pre-wrap">{q.question}</p>
                     
                     <div className="grid md:grid-cols-2 gap-3 text-sm mt-4">
                       {['A', 'B', 'C', 'D'].map(opt => {
                         const val = q[`option_${opt.toLowerCase()}`];
                         if (!val) return null;
                         
                         const isSelectedOpt = ans.selected_answer === opt;
                         const isCorrectOpt = q.correct_answer === opt;
                         
                         let optClass = "p-3 rounded border bg-white";
                         if (isSelectedOpt && isCorrectOpt) optClass = "p-3 rounded border-green-500 bg-green-100 text-green-900 font-medium";
                         else if (isSelectedOpt && !isCorrectOpt) optClass = "p-3 rounded border-red-500 bg-red-100 text-red-900 font-medium";
                         else if (!isSelectedOpt && isCorrectOpt) optClass = "p-3 rounded border-green-500 bg-green-50 text-green-800 border-dashed";
                         
                         return (
                           <div key={opt} className={optClass}>
                              <span className="font-semibold mr-2">{opt}.</span> {val}
                           </div>
                         )
                       })}
                     </div>
                     
                     {q.explanation && (
                       <div className="mt-4 p-4 bg-blue-50 text-blue-900 text-sm rounded-md border border-blue-100">
                         <strong>Explanation:</strong> {q.explanation}
                       </div>
                     )}
                  </CardContent>
                </Card>
              )
           })}
        </div>
      </div>
    </div>
  );
}
