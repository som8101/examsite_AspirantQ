import { getExamById } from '@/services/exams';
import { getExamQuestions } from '@/services/questions';
import { notFound } from 'next/navigation';
import { ReviewClient } from '@/components/admin/ReviewClient';

export default async function ReviewPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();

  const questions = await getExamQuestions(exam.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Questions</h1>
        <p className="text-muted-foreground">Review and approve extracted questions for {exam.title}.</p>
      </div>
      
      <ReviewClient examId={exam.id} initialQuestions={questions} />
    </div>
  );
}
