import { getExamById } from '@/services/exams';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LiveExamClient } from '@/components/student/LiveExamClient';

export default async function LiveExamPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const exam = await getExamById(params.id);
  if (!exam) return notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'student';
  if (!user || role !== 'student') {
    redirect('/login');
  }

  const { data: attempt } = await supabase.from('exam_attempts').select('*').eq('exam_id', exam.id).eq('student_id', user.id).single();

  if (!attempt) {
    redirect(`/student/exams/${exam.id}`);
  }

  if (attempt.status !== 'in_progress') {
    redirect(`/student/results/${attempt.id}`);
  }

  const { data: questions } = await supabase.from('questions')
    .select('id, question_number, question, option_a, option_b, option_c, option_d, marks, negative_marks')
    .eq('exam_id', exam.id)
    .eq('verification_status', 'verified')
    .order('question_number', { ascending: true });
    
  let finalQuestions = questions || [];
  
  if (exam.shuffle_questions && finalQuestions.length > 0) {
    const hashString = (s: string) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
    finalQuestions = [...finalQuestions].sort((a, b) => hashString(a.id + attempt.id) - hashString(b.id + attempt.id));
  }

  const { data: answers } = await supabase.from('attempt_answers')
    .select('question_id, selected_answer')
    .eq('attempt_id', attempt.id);
  
  const initialAnswers: Record<string, string> = {};
  answers?.forEach(a => {
    if (a.selected_answer) initialAnswers[a.question_id] = a.selected_answer;
  });

  return (
    <LiveExamClient 
      exam={exam} 
      attempt={attempt} 
      questions={finalQuestions} 
      initialAnswers={initialAnswers} 
    />
  );
}
