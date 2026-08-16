import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { PlusCircle, Search, Edit, Eye, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase.from('exams').select('*').order('created_at', { ascending: false });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'live': return <Badge className="bg-green-500">Live</Badge>;
      case 'scheduled': return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'review': return <Badge className="bg-amber-500">Review</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage your examinations.</p>
        </div>
        <Link href="/admin/exams/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search exams..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams && exams.length > 0 ? (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.subject || '-'}</TableCell>
                  <TableCell>{exam.total_questions}</TableCell>
                  <TableCell>{exam.duration_minutes}m</TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/exams/${exam.id}`}>
                        <Button variant="ghost" size="icon" title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/exams/${exam.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {(exam.status === 'live' || exam.status === 'completed') && (
                        <Link href={`/admin/exams/${exam.id}/results`}>
                          <Button variant="ghost" size="icon" title="View Results" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No exams found. Click "Create Exam" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
