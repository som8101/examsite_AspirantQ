import { ExamForm } from '@/components/admin/ExamForm';
import { getExamById } from '@/services/exams';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function EditExamPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  
  if (!exam) return notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/exams`}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Exam</h1>
          <p className="text-muted-foreground">Modify configuration for {exam.title}.</p>
        </div>
      </div>
      <ExamForm initialData={exam} />
    </div>
  );
}
