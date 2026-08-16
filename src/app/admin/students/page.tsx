import { createClient } from '@/lib/supabase/server';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function StudentsPage() {
  const supabase = await createClient();
  
  const { data: students } = await supabase
    .from('profiles')
    .select('*, exam_attempts(id)')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Students</h1>
          <p className="text-muted-foreground mt-1">Manage registered students and view their activity.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search students..." className="pl-10 bg-card rounded-full" />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-card/20 text-sm text-muted-foreground">
                <th className="p-5 font-medium">Student Name</th>
                <th className="p-5 font-medium">Email</th>
                <th className="p-5 font-medium">Total Attempts</th>
                <th className="p-5 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {students && students.length > 0 ? (
                students.map((student: any, idx: number) => (
                  <tr key={student.id} className={`border-b border-border/50 hover:bg-card/40 transition-colors ${idx === students.length - 1 ? 'border-none' : ''}`}>
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="font-medium text-foreground">{student.full_name || 'Unknown'}</div>
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {student.email || student.login_id}
                    </td>
                    <td className="p-5 font-medium text-foreground">
                      {student.exam_attempts?.length || 0}
                    </td>
                    <td className="p-5 text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-none">
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    No students registered yet.
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
