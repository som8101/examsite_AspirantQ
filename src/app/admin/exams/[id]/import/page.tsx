import { getExamById } from '@/services/exams';
import { notFound } from 'next/navigation';
import { ImportClient } from '@/components/admin/ImportClient';

export default async function ImportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Questions & Answers</h1>
        <p className="text-muted-foreground">Upload the question paper and answer key for {exam.title}.</p>
      </div>
      
      <ImportClient examId={exam.id} />
    </div>
  );
}
