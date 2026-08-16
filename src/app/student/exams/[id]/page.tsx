import { getExamById } from '@/services/exams';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { AlertCircle, Clock, BookOpen, FileText, Lock, Calendar } from 'lucide-react';
import { startAttempt } from '@/services/attempts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function ExamInstructionPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const exam = await getExamById(params.id);
  
  if (!exam) return notFound();
  if (exam.status !== 'live') {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-2">Exam Not Available</h2>
        <p className="text-muted-foreground">This exam is not currently active.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: existingAttempt } = await supabase.from('exam_attempts').select('id, status').eq('exam_id', exam.id).eq('student_id', user!.id).single();

  if (existingAttempt) {
    if (existingAttempt.status === 'in_progress') {
       redirect(`/student/exam/${exam.id}`);
    } else {
       redirect(`/student/results/${existingAttempt.id}`);
    }
  }

  async function handleStart(formData: FormData) {
    'use server';
    const examId = formData.get('examId') as string;
    const enteredCode = formData.get('accessCode') as string;
    let errorMessage = null;
    
    try {
      if (exam?.access_code && enteredCode !== exam.access_code) {
         throw new Error("Invalid access code.");
      }
      await startAttempt(examId);
    } catch (e: any) {
      errorMessage = e.message || 'An error occurred';
    }
    
    if (errorMessage) {
      redirect(`/student/exams/${examId}?error=${encodeURIComponent(errorMessage)}`);
    } else {
      redirect(`/student/exam/${examId}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
        <p className="text-muted-foreground mt-2">{exam.description || 'Please read the instructions carefully before starting.'}</p>
        
        {searchParams?.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {searchParams.error}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Instructions</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="prose prose-sm max-w-none whitespace-pre-wrap">
               {exam.instructions || '1. Read all questions carefully.\n2. Ensure a stable internet connection.\n3. The exam will auto-submit when the time is up.'}
             </div>
             
             <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3">
               <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
               <div className="text-sm text-amber-900">
                 <p className="font-semibold mb-1">Important Note on Timing:</p>
                 <p>The timer is strictly controlled by the server. Navigating away or closing the browser does not stop the timer. Once started, you must finish within the allotted time.</p>
               </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {exam.scheduled_start_at && (
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Starts At</span>
                  <span className="font-medium text-indigo-600">{new Date(exam.scheduled_start_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/> Duration</span>
                <span className="font-medium">{exam.duration_minutes} Mins</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2"><BookOpen className="h-4 w-4"/> Questions</span>
                <span className="font-medium">{exam.total_questions}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground">Total Marks</span>
                <span className="font-medium">{exam.total_marks || (exam.total_questions * exam.marks_per_question)}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-muted-foreground">Negative Marks</span>
                <span className="font-medium text-red-600">{exam.negative_marks}</span>
              </div>
            </CardContent>
            <CardFooter>
              <form action={handleStart} className="w-full space-y-4">
                <input type="hidden" name="examId" value={exam.id} />
                
                {exam.access_code && (
                   <div className="space-y-2">
                     <Label htmlFor="accessCode" className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Access Code</Label>
                     <Input id="accessCode" name="accessCode" placeholder="Enter access code to unlock..." required className="text-center font-mono tracking-widest text-lg" />
                   </div>
                )}
                
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">Start Exam</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
