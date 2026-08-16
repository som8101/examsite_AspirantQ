import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Basic stats
  const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: attemptCount } = await supabase.from('exam_attempts').select('*', { count: 'exact', head: true });
  
  // Recent exams
  const { data: recentExams } = await supabase.from('exams').select('*, exam_attempts(id)').order('created_at', { ascending: false }).limit(5);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor platform activity and manage recent exams.</p>
        </div>
        <Link href="/admin/exams/create">
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Create AI Exam
          </Button>
        </Link>
      </header>

      {/* Quick Stats Bento Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Total Students</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{studentCount || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Registered users</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Active Exams</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{examCount || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Across all subjects</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Total Attempts</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">{attemptCount || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Completed tests</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel rounded-3xl overflow-hidden mt-8">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-card/40">
          <h2 className="text-xl font-semibold text-foreground">Recent Exams</h2>
          <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10">View All</Button>
        </div>
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-card/20 text-sm text-muted-foreground">
                <th className="p-5 font-medium">Exam Name</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Attempts</th>
                <th className="p-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentExams && recentExams.length > 0 ? (
                recentExams.map((exam: any, idx: number) => (
                  <tr key={exam.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors ${idx === recentExams.length - 1 ? 'border-none' : ''}`}>
                     <td className="p-5">
                       <p className="font-medium text-foreground">{exam.title}</p>
                       <p className="text-xs text-muted-foreground">{exam.subject || 'General'}</p>
                     </td>
                     <td className="p-5">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                         exam.status === 'live' ? 'bg-green-100 text-green-800 border-green-200' :
                         exam.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                         'bg-slate-100 text-slate-800 border-slate-200'
                       }`}>
                         {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                       </span>
                     </td>
                     <td className="p-5 text-foreground font-medium">{exam.exam_attempts?.length || 0}</td>
                     <td className="p-5 text-right">
                       <Button variant="ghost" size="sm" className="rounded-full text-primary hover:text-primary hover:bg-primary/10">Manage</Button>
                     </td>
                  </tr>
                ))
              ) : (
                <tr className="border-none">
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No recent exams found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
