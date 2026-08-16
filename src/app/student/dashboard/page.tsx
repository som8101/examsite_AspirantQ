import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Play, Clock, Calendar, CheckCircle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: liveExams } = await supabase.from('exams').select('*').eq('status', 'live').order('created_at', { ascending: false });
  const { data: scheduledExams } = await supabase.from('exams').select('*').eq('status', 'scheduled').order('scheduled_start_at', { ascending: true });
  const { data: pastAttempts } = await supabase.from('exam_attempts').select('*, exams(title, total_marks)').eq('student_id', user!.id).order('created_at', { ascending: false });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your student dashboard. Find available exams and view your past results.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Play className="h-5 w-5 text-green-500" /> Available Now
        </h2>
        
        {liveExams && liveExams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveExams.map(exam => {
              const attempt = pastAttempts?.find(a => a.exam_id === exam.id);
              const isCompleted = attempt && attempt.status !== 'in_progress';
              
              return (
                <Card key={exam.id} className={isCompleted ? "opacity-75" : "border-green-200 shadow-sm"}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1" title={exam.title}>{exam.title}</CardTitle>
                    <CardDescription>{exam.subject || 'General'}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> {exam.duration_minutes} Minutes</div>
                    <div className="flex items-center gap-2"><BookOpen className="h-4 w-4"/> {exam.total_questions} Questions</div>
                  </CardContent>
                  <CardFooter>
                    {isCompleted ? (
                       <Link href={`/student/results/${attempt.id}`} className="w-full">
                         <Button variant="secondary" className="w-full">View Result</Button>
                       </Link>
                    ) : attempt?.status === 'in_progress' ? (
                       <Link href={`/student/exam/${exam.id}`} className="w-full">
                         <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">Resume Exam</Button>
                       </Link>
                    ) : (
                       <Link href={`/student/exams/${exam.id}`} className="w-full">
                         <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Start Exam</Button>
                       </Link>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-white text-muted-foreground">
            No exams are currently live.
          </div>
        )}
      </div>

      {scheduledExams && scheduledExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" /> Upcoming Scheduled Exams
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledExams.map(exam => (
              <Card key={exam.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription>{new Date(exam.scheduled_start_at!).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>Not Yet Started</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastAttempts && pastAttempts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-slate-500" /> Past Results
          </h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                 <tr>
                   <th className="px-4 py-3">Exam</th>
                   <th className="px-4 py-3">Date</th>
                   <th className="px-4 py-3">Score</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3 text-right">Action</th>
                 </tr>
               </thead>
               <tbody>
                 {pastAttempts.map(attempt => (
                   <tr key={attempt.id} className="border-b last:border-0 hover:bg-slate-50">
                     <td className="px-4 py-3 font-medium">{attempt.exams?.title}</td>
                     <td className="px-4 py-3">{new Date(attempt.created_at).toLocaleDateString()}</td>
                     <td className="px-4 py-3">
                        {attempt.status === 'submitted' || attempt.status === 'auto_submitted' 
                          ? `${attempt.score} / ${attempt.exams?.total_marks || '-'}`
                          : '-'}
                     </td>
                     <td className="px-4 py-3">
                       <Badge variant={attempt.status === 'in_progress' ? 'default' : 'secondary'}>
                         {attempt.status.replace('_', ' ')}
                       </Badge>
                     </td>
                     <td className="px-4 py-3 text-right">
                        {attempt.status !== 'in_progress' && (
                           <Link href={`/student/results/${attempt.id}`}>
                             <Button variant="ghost" size="sm">View</Button>
                           </Link>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
