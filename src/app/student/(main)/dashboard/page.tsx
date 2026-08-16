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

  // Calculate stats
  const examsTaken = pastAttempts?.filter(a => a.status === 'submitted' || a.status === 'auto_submitted').length || 0;
  const avgScore = examsTaken > 0 ? 
    Math.round((pastAttempts?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0) / examsTaken) : 0;

  return (
    <div className="space-y-8 max-w-[1280px] mx-auto w-full pb-24">
      {/* Welcome Header */}
      <header className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary border-2 border-white/50 shadow-sm shrink-0">
            {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h1 className="text-3xl text-primary font-bold mb-1">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-muted-foreground">Ready to ace your next exam?</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
          <div className="glass-panel rounded-2xl p-4 flex-1 md:flex-none flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Exams Taken</span>
            <span className="text-4xl text-primary font-bold">{examsTaken}</span>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex-1 md:flex-none flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Avg Score</span>
            <span className="text-4xl text-primary font-bold">{avgScore}</span>
          </div>
        </div>
      </header>

      {/* Available Now Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
             Available Exams
          </h2>
        </div>
        
        {liveExams && liveExams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveExams.map(exam => {
              const attempt = pastAttempts?.find(a => a.exam_id === exam.id);
              const isCompleted = attempt && attempt.status !== 'in_progress';
              
              return (
                <div key={exam.id} className={`glass-panel rounded-3xl p-6 flex flex-col ${isCompleted ? "opacity-70" : ""}`}>
                  <div className="mb-4">
                    <Badge variant={isCompleted ? "secondary" : "default"} className={`mb-3 ${!isCompleted && 'bg-primary/20 text-primary hover:bg-primary/30 border-none'}`}>
                      {isCompleted ? "Completed" : "Live"}
                    </Badge>
                    <h3 className="text-xl font-bold line-clamp-1 text-foreground mb-1" title={exam.title}>{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">{exam.subject || 'General Assessment'}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <span>{exam.duration_minutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span>{exam.total_questions} Questions</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {isCompleted ? (
                       <Link href={`/student/results/${attempt.id}`} className="block">
                         <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/10">View Result</Button>
                       </Link>
                    ) : attempt?.status === 'in_progress' ? (
                       <Link href={`/student/exam/${exam.id}`} className="block">
                         <Button className="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md">Resume Exam</Button>
                       </Link>
                    ) : (
                       <Link href={`/student/exams/${exam.id}`} className="block">
                         <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">Start Exam</Button>
                       </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No active exams</h3>
            <p className="text-muted-foreground max-w-md mx-auto">There are currently no exams available for you to take. Check back later or review your past results.</p>
          </div>
        )}
      </div>

      {/* Scheduled Exams Section */}
      {scheduledExams && scheduledExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
             Upcoming Exams
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledExams.map(exam => (
              <div key={exam.id} className="glass-panel rounded-3xl p-6 flex flex-col opacity-80">
                <div className="mb-6">
                   <Badge variant="outline" className="mb-3">Scheduled</Badge>
                  <h3 className="text-xl font-bold line-clamp-1">{exam.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(exam.scheduled_start_at!).toLocaleString()}</p>
                </div>
                <div className="mt-auto">
                  <Button variant="secondary" className="w-full rounded-full bg-card" disabled>Waiting to start</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Results Section */}
      {pastAttempts && pastAttempts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
             Recent Submissions
          </h2>
          <div className="glass-panel rounded-3xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-border bg-card/30 text-sm text-muted-foreground">
                     <th className="p-4 font-medium">Exam Title</th>
                     <th className="p-4 font-medium">Date Taken</th>
                     <th className="p-4 font-medium">Score</th>
                     <th className="p-4 font-medium">Status</th>
                     <th className="p-4 font-medium text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {pastAttempts.map((attempt, idx) => (
                     <tr key={attempt.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors ${idx === pastAttempts.length - 1 ? 'border-none' : ''}`}>
                       <td className="p-4 font-medium text-foreground">{attempt.exams?.title}</td>
                       <td className="p-4 text-muted-foreground">{new Date(attempt.created_at).toLocaleDateString()}</td>
                       <td className="p-4">
                          {attempt.status === 'submitted' || attempt.status === 'auto_submitted' ? (
                             <span className="font-semibold text-primary">{attempt.score} / {attempt.exams?.total_marks || '-'}</span>
                          ) : (
                             <span className="text-muted-foreground">-</span>
                          )}
                       </td>
                       <td className="p-4">
                         <Badge variant="outline" className="bg-background/50 border-border">
                           {attempt.status.replace('_', ' ')}
                         </Badge>
                       </td>
                       <td className="p-4 text-right">
                          {attempt.status !== 'in_progress' && (
                             <Link href={`/student/results/${attempt.id}`}>
                               <Button variant="ghost" size="sm" className="rounded-full text-primary hover:text-primary hover:bg-primary/10">View Details</Button>
                             </Link>
                          )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
