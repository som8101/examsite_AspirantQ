import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getExamById } from '@/services/exams';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/admin/exams/${exam.id}`}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Student Results</h1>
          <p className="text-muted-foreground">Results and attempts for: {exam.title}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              {attempts?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              {completedAttempts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              {inProgressAttempts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
          <CardDescription>A real-time view of all student submissions.</CardDescription>
        </CardHeader>
        <CardContent>
           {attempts && attempts.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                   <tr>
                     <th className="px-4 py-3 rounded-tl-md">Student</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3">Score</th>
                     <th className="px-4 py-3">Started At</th>
                     <th className="px-4 py-3">Submitted At</th>
                     <th className="px-4 py-3 rounded-tr-md text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {attempts.map((attempt) => (
                     <tr key={attempt.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3">
                         <div className="font-medium">{attempt.profiles?.full_name || 'Unknown Student'}</div>
                         <div className="text-xs text-muted-foreground">{attempt.profiles?.login_id || attempt.profiles?.email}</div>
                       </td>
                       <td className="px-4 py-3">
                         <Badge variant={['submitted', 'auto_submitted'].includes(attempt.status) ? 'default' : 'secondary'} className={['submitted', 'auto_submitted'].includes(attempt.status) ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
                           {attempt.status.replace('_', ' ').toUpperCase()}
                         </Badge>
                       </td>
                       <td className="px-4 py-3 font-medium">
                         {['submitted', 'auto_submitted'].includes(attempt.status) ? (
                           <span className={attempt.score >= (exam.passing_marks || 0) ? 'text-emerald-600' : ''}>
                             {attempt.score} / {exam.total_marks || exam.total_questions}
                           </span>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </td>
                       <td className="px-4 py-3 text-muted-foreground">
                         {new Date(attempt.started_at).toLocaleString()}
                       </td>
                       <td className="px-4 py-3">
                         {['submitted', 'auto_submitted'].includes(attempt.status) && attempt.submitted_at ? (
                           new Date(attempt.submitted_at).toLocaleString()
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </td>
                       <td className="px-4 py-3 text-right">
                         <Link href={`/admin/exams/${exam.id}/results/${attempt.id}`}>
                           <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                             View Details
                           </Button>
                         </Link>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="text-center py-12 border-2 border-dashed rounded-lg">
               <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
               <h3 className="font-medium">No attempts yet</h3>
               <p className="text-sm text-muted-foreground mt-1">When students take this exam, their results will appear here.</p>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
