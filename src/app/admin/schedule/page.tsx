import { createClient } from '@/lib/supabase/server';
import { Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default async function SchedulePage() {
  const supabase = await createClient();
  
  // Fetch only upcoming or currently scheduled exams
  const { data: scheduledExams } = await supabase
    .from('exams')
    .select('*')
    .in('status', ['live', 'scheduled'])
    .order('scheduled_start_at', { ascending: true });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Schedule</h1>
          <p className="text-muted-foreground mt-1">View upcoming and active exam schedules.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search schedule..." className="pl-10 bg-card rounded-full" />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-card/20 text-sm text-muted-foreground">
                <th className="p-5 font-medium">Exam Name</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Scheduled Start</th>
                <th className="p-5 font-medium">Scheduled End</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {scheduledExams && scheduledExams.length > 0 ? (
                scheduledExams.map((exam: any, idx: number) => (
                  <tr key={exam.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors ${idx === scheduledExams.length - 1 ? 'border-none' : ''}`}>
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="font-medium text-foreground">{exam.title}</div>
                    </td>
                    <td className="p-5">
                      {exam.status === 'live' ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
                      ) : (
                        <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>
                      )}
                    </td>
                    <td className="p-5 font-medium text-foreground">
                      {exam.scheduled_start_at ? new Date(exam.scheduled_start_at).toLocaleString() : 'Not Set'}
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {exam.scheduled_end_at ? new Date(exam.scheduled_end_at).toLocaleString() : 'Not Set'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-none">
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    No scheduled exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
