import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getExamById } from '@/services/exams';
import { ResultsTableClient } from '@/components/admin/ResultsTableClient';

export default async function AdminExamResultsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();

  const supabase = await createClient();

  // Fetch all attempts for this exam with student profiles
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      profiles!student_id(full_name, email, login_id)
    `)
    .eq('exam_id', exam.id)
    .order('created_at', { ascending: false });

  const completedAttempts = attempts?.filter(a => ['submitted', 'auto_submitted'].includes(a.status)) || [];
  const inProgressAttempts = attempts?.filter(a => a.status === 'in_progress') || [];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/dashboard`}>
          <Button variant="outline" size="icon" className="rounded-full bg-card hover:bg-card/80"><ArrowLeft className="h-4 w-4 text-primary" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Student Results</h1>
          <p className="text-muted-foreground mt-1">Results and attempts for: {exam.title}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Total Participants</h3>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{attempts?.length || 0}</div>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Completed</h3>
            <div className="w-10 h-10 rounded-full bg-[#E5EFE2] flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-[#4a5f42]" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{completedAttempts.length}</div>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">In Progress</h3>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{inProgressAttempts.length}</div>
          </div>
        </div>
      </div>

      <ResultsTableClient attempts={attempts || []} exam={exam} />
    </div>
  );
}
