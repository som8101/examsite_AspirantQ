import { getExamById } from '@/services/exams';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, CheckCircle, Calendar, Play } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SchedulePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();

  const supabase = await createClient();
  const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam.id);
  const { count: pendingCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam.id).eq('verification_status', 'pending');
  
  const isReady = questionsCount === exam.total_questions && pendingCount === 0;

  async function handlePublish() {
    'use server';
    const supabaseServer = await createClient();
    
    let newStatus = 'live';
    if (exam?.schedule_type === 'scheduled' && exam.scheduled_start_at) {
        if (new Date() < new Date(exam.scheduled_start_at)) {
            newStatus = 'scheduled';
        }
    }
    
    await supabaseServer.from('exams').update({ status: newStatus }).eq('id', exam!.id);
    revalidatePath(`/admin/exams/${exam!.id}`);
    redirect(`/admin/exams/${exam!.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Publish Exam</h1>
        <p className="text-muted-foreground">Finalize and publish {exam.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Flight Checks</CardTitle>
          <CardDescription>We've checked your exam configuration to ensure it's ready for students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {questionsCount === exam.total_questions ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">Total Questions Match</p>
              <p className="text-sm text-muted-foreground">Found {questionsCount} out of {exam.total_questions} configured questions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="font-medium">Verification Complete</p>
              <p className="text-sm text-muted-foreground">{pendingCount} questions are pending review.</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            {isReady ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md">
                <strong>Ready to Go!</strong> Your exam is fully configured and all questions are verified.
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                <strong>Not Ready.</strong> Please resolve the issues above before publishing. Ensure all expected questions exist and are verified.
              </div>
            )}
          </div>
          
          {isReady && (
            <form action={handlePublish} className="pt-4">
               <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
                 {exam.schedule_type === 'scheduled' ? (
                   <><Calendar className="h-5 w-5 mr-2"/> Schedule Exam</>
                 ) : (
                   <><Play className="h-5 w-5 mr-2"/> Publish & Go Live Now</>
                 )}
               </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
