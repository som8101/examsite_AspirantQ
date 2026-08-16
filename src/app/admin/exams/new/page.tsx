import { ExamForm } from '@/components/admin/ExamForm';

export default function NewExamPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Exam</h1>
        <p className="text-muted-foreground">Set up a new examination and configure its rules.</p>
      </div>
      <ExamForm />
    </div>
  );
}
