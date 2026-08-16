import { getExamById } from '@/services/exams';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Upload, CheckSquare, Calendar, Play, Users, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function ExamDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();
  
  const supabase = await createClient();
  const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam.id);
  const { count: pendingQuestions } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('exam_id', exam.id).eq('verification_status', 'pending');
  
  const { data: qp } = await supabase.from('question_papers').select('*').eq('exam_id', exam.id).order('created_at', { ascending: false }).limit(1).single();
  const { data: ak } = await supabase.from('answer_keys').select('*').eq('exam_id', exam.id).order('created_at', { ascending: false }).limit(1).single();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/exams">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{exam.category || 'No Category'}</Badge>
            <Badge variant={exam.status === 'live' ? 'default' : 'secondary'}>{exam.status.toUpperCase()}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/exams/${exam.id}/edit`}>
             <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          </Link>
          <form action={async () => { 'use server'; const { duplicateExamAction } = await import('@/app/admin/exams/actions'); await duplicateExamAction(exam.id); }}>
            <Button variant="outline"><Copy className="h-4 w-4 mr-2" /> Duplicate</Button>
          </form>
          {exam.status === 'draft' && (
            <Link href={`/admin/exams/${exam.id}/import`}>
              <Button><Upload className="h-4 w-4 mr-2" /> Import Q&A</Button>
            </Link>
          )}
          {exam.status === 'review' && (
            <Link href={`/admin/exams/${exam.id}/review`}>
              <Button><CheckSquare className="h-4 w-4 mr-2" /> Review Questions</Button>
            </Link>
          )}
          {(exam.status === 'draft' || exam.status === 'review' || exam.status === 'scheduled') && (
            <Link href={`/admin/exams/${exam.id}/schedule`}>
              <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                 {exam.schedule_type === 'scheduled' ? <Calendar className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                 Publish / Schedule
              </Button>
            </Link>
          )}
          {(exam.status === 'live' || exam.status === 'completed') && (
            <Link href={`/admin/exams/${exam.id}/results`}>
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                 <Users className="h-4 w-4 mr-2" />
                 View Student Results
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Exam Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p>{exam.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questions (Configured)</p>
                <p>{exam.total_questions}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marks Per Question</p>
                <p>{exam.marks_per_question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Negative Marks</p>
                <p>{exam.negative_marks}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Schedule Type</p>
                <p className="capitalize">{exam.schedule_type}</p>
              </div>
              {exam.schedule_type === 'scheduled' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Start</p>
                  <p>{exam.scheduled_start_at ? new Date(exam.scheduled_start_at).toLocaleString() : 'Not Set'}</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground">Instructions</p>
              <p className="whitespace-pre-wrap mt-1 text-sm">{exam.instructions || 'No instructions provided.'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Question Paper</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="truncate max-w-[150px]">{qp ? qp.file_name : 'Not Uploaded'}</span>
                  {qp && <Badge variant={qp.processing_status === 'completed' ? 'default' : 'secondary'}>{qp.processing_status}</Badge>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Answer Key</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="truncate max-w-[150px]">{ak ? ak.file_name : 'Not Uploaded'}</span>
                  {ak && <Badge variant={ak.processing_status === 'completed' ? 'default' : 'secondary'}>{ak.processing_status}</Badge>}
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground">Extracted Questions</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold">{questionsCount || 0}</span>
                  <span className="text-sm text-muted-foreground">/ {exam.total_questions} expected</span>
                </div>
                {pendingQuestions !== null && pendingQuestions > 0 && (
                   <p className="text-xs text-amber-600 mt-1">{pendingQuestions} questions require review.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
